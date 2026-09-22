import { Injectable, computed, signal } from '@angular/core';

import { Achievement, ACHIEVEMENTS, RANKS } from './achievements';

const storageKey = 'silomer';

/* Tempo is clicks within this window, so the number reads as clicks per second. */
const tempoWindowMs = 1000;

interface SavedState {
  count: number;
  best: number;
  bestTempo: number;
  unlocked: string[];
}

function isSavedState(value: unknown): value is SavedState {
  const state = value as SavedState | null;
  return !!state
    && typeof state.count === 'number'
    && typeof state.best === 'number'
    && typeof state.bestTempo === 'number'
    && Array.isArray(state.unlocked);
}

/* Anything on this origin can write to the key, and an older build could have
 * left a different shape behind, so parsed state is checked before it is used. */
function readSaved(): SavedState | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isSavedState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class ClickerStore {

  private hits: number[] = [];
  private decay?: ReturnType<typeof setInterval>;

  readonly count = signal(0);
  readonly best = signal(0);
  readonly tempo = signal(0);
  readonly bestTempo = signal(0);
  readonly unlocked = signal<readonly string[]>([]);

  /* The newest badge, so the template can fly it in. Cleared once it has landed. */
  readonly landing = signal<Achievement | null>(null);

  /* Handed to @for rather than @if: keyed on the id, a badge arriving while the
   * previous one is still in flight gets a fresh element and its own animation. */
  readonly landings = computed(() => {
    const landing = this.landing();
    return landing ? [landing] : [];
  });

  /* Index of the last rank reached; the ladder starts at 0 so there is always one. */
  readonly level = computed(() => {
    const count = this.count();
    let index = 0;
    for (let i = 0; i < RANKS.length; i++) {
      if (count >= RANKS[i].at) {
        index = i;
      }
    }
    return index;
  });

  readonly rank = computed(() => RANKS[this.level()].label);

  readonly levelCount = RANKS.length;

  /* Seven heat steps, keeping the thresholds the original background ramp used. */
  readonly heat = computed(() => Math.min(7, Math.ceil(this.count() / 10) || 1));

  readonly badges = computed(() => {
    const unlocked = this.unlocked();
    return ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      earned: unlocked.includes(achievement.id)
    }));
  });

  readonly classicBadges = computed(() => this.badges().filter((badge) => !badge.secret));

  readonly secretBadges = computed(() => this.badges().filter((badge) => badge.secret));

  /* Counted from matched badges, not raw stored ids: ids renamed between builds
   * would otherwise push the total past the number of badges that exist. */
  readonly earnedCount = computed(() => this.badges().filter((badge) => badge.earned).length);

  constructor() {
    const saved = readSaved();
    if (saved) {
      this.count.set(saved.count);
      this.best.set(saved.best);
      this.bestTempo.set(saved.bestTempo);
      this.unlocked.set(saved.unlocked);
    }

  }

  /* Written straight from hit() rather than an effect, so persistence does not
   * depend on a change detection pass ever running. */
  private persist(): void {
    const state: SavedState = {
      count: this.count(),
      best: this.best(),
      bestTempo: this.bestTempo(),
      unlocked: [...this.unlocked()]
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      /* Private mode or a full quota - the counter still works, it just forgets. */
    }
  }

  hit(): void {
    this.count.update((count) => count + 1);
    this.best.update((best) => Math.max(best, this.count()));
    this.registerTempo();
    this.award();
    this.persist();
  }

  reset(): void {
    this.count.set(0);
    this.hits = [];
    this.tempo.set(0);
    this.landing.set(null);
    this.persist();
  }

  private registerTempo(): void {
    this.hits.push(Date.now());
    this.refreshTempo();
    this.decay ??= setInterval(() => this.refreshTempo(), 100);
  }

  private refreshTempo(): void {
    const since = Date.now() - tempoWindowMs;
    this.hits = this.hits.filter((at) => at > since);
    this.tempo.set(this.hits.length);
    this.bestTempo.update((best) => Math.max(best, this.hits.length));

    if (!this.hits.length && this.decay) {
      clearInterval(this.decay);
      this.decay = undefined;
    }
  }

  private award(): void {
    /* One hit can clear two marks at once, so every newly earned badge is
     * taken - only the last one gets the fly-in. */
    const earned = ACHIEVEMENTS.filter((achievement) => {
      if (this.unlocked().includes(achievement.id)) {
        return false;
      }
      return achievement.kind === 'count'
        ? this.count() >= achievement.at
        : this.tempo() >= achievement.at;
    });

    if (!earned.length) {
      return;
    }

    this.unlocked.update((ids) => [...ids, ...earned.map((a) => a.id)]);
    this.landing.set(earned[earned.length - 1]);
  }

  clearLanding(): void {
    this.landing.set(null);
  }
}
