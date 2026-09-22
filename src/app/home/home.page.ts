import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [NgClass, IonContent, IonHeader, IonTitle, IonToolbar]
})
export class HomePage implements OnInit {

  public count = 0;

  constructor() {}

  ngOnInit() {

  }

  private get getCount() {
    return this.count;
  }

  public get bgColor() {
    const count = this.getCount;
    if (count <= 10) {
      return 'bg1';
    } else if (count > 10 && count <= 20) {
      return 'bg2';
    } else if (count > 20 && count <= 30) {
      return 'bg3';
    } else if (count > 30 && count <= 40) {
      return 'bg4';
    } else if (count > 40 && count <= 50) {
      return 'bg5';
    } else if (count > 50 && count <= 60) {
      return 'bg6';
    } else {
      return 'bg7';
    }
  }

  public isClicked() {
    this.count++;
  }
}
