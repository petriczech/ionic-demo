/*
 * Capacitor plugins are Proxy objects (registerPlugin), so they cannot be
 * intercepted with vi.spyOn - the whole module is mocked instead.
 */
const nativeMocks = vi.hoisted(() => ({
  setStyle: vi.fn().mockResolvedValue(undefined),
  hide: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => true }
}));

vi.mock('@capacitor/status-bar', () => ({
  StatusBar: { setStyle: nativeMocks.setStyle },
  Style: { Default: 'DEFAULT' }
}));

vi.mock('@capacitor/splash-screen', () => ({
  SplashScreen: { hide: nativeMocks.hide }
}));

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Platform } from '@ionic/angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  let platformReadySpy: Promise<void>;
  let platformSpy: { ready: () => Promise<void> };

  beforeEach(async () => {
    nativeMocks.setStyle.mockClear();
    nativeMocks.hide.mockClear();
    platformReadySpy = Promise.resolve();
    platformSpy = { ready: vi.fn().mockReturnValue(platformReadySpy) };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: Platform, useValue: platformSpy }
      ]
    })
      .overrideComponent(AppComponent, {
        set: { imports: [], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize the app', async () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
    await Promise.resolve();
    expect(nativeMocks.setStyle).toHaveBeenCalledWith({ style: 'DEFAULT' });
    expect(nativeMocks.hide).toHaveBeenCalled();
  });

  // TODO: add more tests!

});
