import { TestBed } from '@angular/core/testing';

import { ClickerStore } from './clicker.store';

/* Hits are spaced out so the tempo badges stay out of the way; the tempo
 * tests fire them on purpose instead. */
const calmGapMs = 400;

describe('ClickerStore', () => {

  let store: ClickerStore;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    TestBed.resetTestingModule();
    store = TestBed.inject(ClickerStore);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function hitCalmly(times: number, target: ClickerStore = store): void {
    for (let i = 0; i < times; i++) {
      target.hit();
      vi.advanceTimersByTime(calmGapMs);
    }
  }

  it('counts hits and keeps the best across a reset', () => {
    hitCalmly(2);
    expect(store.count()).toBe(2);
    expect(store.best()).toBe(2);

    store.reset();
    expect(store.count()).toBe(0);
    expect(store.best()).toBe(2);
  });

  it('starts at the nudge and climbs the taunt ladder', () => {
    expect(store.rank()).toBe('no tak, zmáčkni to');

    hitCalmly(10);
    expect(store.rank()).toBe('rozjíždíš se');

    hitCalmly(15);
    expect(store.rank()).toBe('tohle už je koníček');
  });

  it('keeps the seven heat steps of the original background ramp', () => {
    expect(store.heat()).toBe(1);

    hitCalmly(10);
    expect(store.heat()).toBe(1);

    hitCalmly(1);
    expect(store.heat()).toBe(2);

    hitCalmly(60);
    expect(store.heat()).toBe(7);
  });

  it('awards a count badge once and offers it for the fly-in', () => {
    hitCalmly(10);

    expect(store.landing()?.id).toBe('rozjezd');
    expect(store.earnedCount()).toBe(1);

    store.clearLanding();
    expect(store.landing()).toBeNull();

    hitCalmly(1);
    expect(store.earnedCount()).toBe(1);
  });

  it('splits the board into plain milestones and secret badges', () => {
    expect(store.classicBadges().every((b) => b.kind === 'count')).toBe(true);
    expect(store.secretBadges().map((b) => b.id)).toEqual(['autoklikr']);
    expect(store.classicBadges().length + store.secretBadges().length).toBe(store.badges().length);
  });

  it('leaves the secret badge locked no matter how long you keep clicking', () => {
    hitCalmly(60);

    expect(store.earnedCount()).toBeGreaterThan(2);
    expect(store.secretBadges()[0].earned).toBe(false);
  });

  it('awards the autoclicker badge past nine a second without touching the stamp', () => {
    for (let i = 0; i < 9; i++) {
      store.hit();
    }

    expect(store.tempo()).toBe(9);
    expect(store.badges().find((b) => b.id === 'autoklikr')?.earned).toBe(true);

    /* The stamp keeps showing the count rank, so it cannot flicker with tempo. */
    expect(store.rank()).toBe('rozjíždíš se');
    vi.advanceTimersByTime(1200);
    expect(store.rank()).toBe('rozjíždíš se');
  });

  it('lets the tempo fall back to zero once the hitting stops', () => {
    for (let i = 0; i < 4; i++) {
      store.hit();
    }
    expect(store.tempo()).toBe(4);

    vi.advanceTimersByTime(1200);
    expect(store.tempo()).toBe(0);
    expect(store.bestTempo()).toBe(4);
  });

  it('gives out every badge cleared by a single hit', () => {
    hitCalmly(24);
    expect(store.earnedCount()).toBe(1);

    /* 25 clears "jsi velmistr" on its own, but a jump would clear more. */
    hitCalmly(1);
    expect(store.earnedCount()).toBe(2);
    expect(store.landing()?.id).toBe('konicek');
  });

  it('climbs the taunt ladder faster than the badge list', () => {
    expect(store.level()).toBe(0);
    expect(store.levelCount).toBe(20);

    hitCalmly(5);
    expect(store.rank()).toBe('to byly tři');
    expect(store.earnedCount()).toBe(0);

    hitCalmly(10);
    expect(store.rank()).toBe('ruka ještě drží');

    hitCalmly(15);
    expect(store.rank()).toBe('tohle už je koníček');
  });

  it('counts only badges that still exist', () => {
    localStorage.setItem('silomer', JSON.stringify({
      count: 40, best: 40, bestTempo: 0,
      unlocked: ['rozjezd', 'konicek', 'normalni', 'odznak-ze-stare-verze']
    }));

    TestBed.resetTestingModule();
    const restored = TestBed.inject(ClickerStore);

    /* The stale id must not push the total past the badges that exist. */
    expect(restored.earnedCount()).toBe(3);
    expect(restored.earnedCount()).toBeLessThanOrEqual(restored.badges().length);
  });

  it('clears a badge still in flight when the counter is zeroed', () => {
    hitCalmly(8);
    expect(store.landing()).not.toBeNull();

    store.reset();
    expect(store.landing()).toBeNull();
    expect(store.count()).toBe(0);
  });

  it('restores a saved run', () => {
    hitCalmly(20);

    TestBed.resetTestingModule();
    const restored = TestBed.inject(ClickerStore);

    expect(restored.count()).toBe(20);
    expect(restored.rank()).toBe('ruka ještě drží');
    expect(restored.earnedCount()).toBe(1);
  });

  it('ignores a saved state of the wrong shape', () => {
    localStorage.setItem('silomer', JSON.stringify({ count: 5 }));

    TestBed.resetTestingModule();
    const fresh = TestBed.inject(ClickerStore);

    expect(fresh.count()).toBe(0);
    expect(fresh.badges().length).toBe(10);
    expect(() => fresh.hit()).not.toThrow();
  });

  it('hands the newest badge to the template as a keyed single-item list', () => {
    expect(store.landings()).toEqual([]);

    hitCalmly(10);
    expect(store.landings().map((b) => b.id)).toEqual(['rozjezd']);

    store.clearLanding();
    expect(store.landings()).toEqual([]);
  });

  it('survives a hostile localStorage', () => {
    const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };

    try {
      TestBed.resetTestingModule();
      const fresh = TestBed.inject(ClickerStore);
      hitCalmly(1, fresh);
      expect(fresh.count()).toBe(1);
    } finally {
      Storage.prototype.getItem = getItem;
    }
  });
});
