import { Platform } from 'react-native';
import { enabled } from 'react-native-privacy-snapshot';
import { updateEvent } from '../components/DialogManager/recievers';
import { Actions } from '../provider/Actions';
import { useSettingStore } from '../provider/stores';
import { AndroidModule, preloadImages, sortSettings } from '../utils';
import { getColorScheme } from '../utils/ColorUtils';
import { MMKV } from '../utils/mmkv';
import { scale, updateSize } from '../utils/SizeUtils';
import Navigation from './Navigation';

export const defaultSettings = {
  showToolbarOnTop: false,
  showKeyboardOnOpen: false,
  fontScale: 1,
  forcePortraitOnTablet: false,
  useSystemTheme: false,
  reminder: 'off',
  encryptedBackup: false,
  homepage: 'Notes',
  sort: 'default',
  sortOrder: 'desc',
  screenshotMode: true,
  privacyScreen: false,
  appLockMode: 'none',
  telemetry:false 
}

let settings = {...defaultSettings}

let appLoaded = false;

function setAppLoaded() {
  appLoaded = true;
}

function getApploaded() {
  return appLoaded;
}

async function init() {
  scale.fontScale = 1;
  settings = await MMKV.getItem('appSettings');
  if (!settings) {
    settings = defaultSettings
    await MMKV.setItem('appSettings', JSON.stringify(settings));
  } else {
    settings = JSON.parse(settings);
    if (!settings.appLockMode) {
      settings.appLockMode = "none";
    }
  }

  Navigation.setHeaderState(
    settings.homepage,
    {
      menu: true,
    },
    {
      heading: settings.homepage,
      id: settings.homepage.toLowerCase() + '_navigation',
    },
  );

  if (settings.fontScale) {
    scale.fontScale = settings.fontScale;
  }
  if (settings.privacyScreen || settings.appLockMode === "background") {
    if (Platform.OS === 'android') {
      AndroidModule.setSecureMode(true);
    } else {
      enabled(true);
    }
  } else {
    if (Platform.OS === 'android') {
      AndroidModule.setSecureMode(false);
    } else {
      enabled(false);
    }
  }
  sortSettings.sort = settings.sort;
  sortSettings.sortOrder = settings.sortOrder;
  updateSize();
  useSettingStore.getState().setSettings({...settings});
  setTheme();
  return;
}

const setTheme = async () => {
  if (settings) {
    let newColors = await getColorScheme(settings.useSystemTheme);
    preloadImages(newColors.accent)
    updateEvent({type: Actions.THEME, colors: newColors});
  }
};

async function set(name, value) {
  settings[name] = value;
  settings = {...settings};
  await MMKV.setItem('appSettings', JSON.stringify(settings));
  useSettingStore.getState().setSettings({...settings});
}

function get() {
  return {...settings};
}

export default {
  init,
  setTheme,
  set,
  get,
  setAppLoaded,
  getApploaded,
};
