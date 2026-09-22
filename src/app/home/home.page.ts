import { Component, computed, inject, signal } from '@angular/core';

import { IonContent, IonModal } from '@ionic/angular';

import { ClickerStore } from './clicker.store';

/* The tempo arc is full at this rate, a little above the fastest achievement. */
const tempoCeiling = 12;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent, IonModal]
})
export class HomePage {

  protected readonly store = inject(ClickerStore);

  protected readonly boardOpen = signal(false);
  protected readonly rings = signal<readonly number[]>([]);

  protected readonly tempoRatio = computed(() => Math.min(1, this.store.tempo() / tempoCeiling));

  private nextRing = 0;

  protected tap(): void {
    this.store.hit();
    this.rings.update((rings) => [...rings, this.nextRing++].slice(-12));
  }

  /* Driven by the animation rather than a timer, so nothing is left pending
   * when the page goes away and the two can never drift apart. */
  protected dropRing(id: number): void {
    this.rings.update((rings) => rings.filter((ring) => ring !== id));
  }
}
