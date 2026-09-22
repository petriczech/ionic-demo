import { Component, inject } from '@angular/core';

import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet]
})
export class AppComponent {
  private platform = inject(Platform);

  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      // StatusBar and SplashScreen only exist on a native platform;
      // calling them on the web would throw.
      if (!Capacitor.isNativePlatform()) {
        return;
      }
      await StatusBar.setStyle({ style: Style.Default });
      await SplashScreen.hide();
    });
  }
}
