import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

// Coordonnées par défaut (Dakar, Sénégal) en cas de refus ou d'échec GPS
const DEFAULT_LOCATION = {
  coords: {
    latitude: 14.6928,
    longitude: -17.4467,
    altitude: null,
    accuracy: 0,
    heading: 0,
    speed: 0,
    altitudeAccuracy: null,
  },
  timestamp: Date.now(),
};

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (e) {
    console.error('Erreur permission localisation:', e);
  }
  return false;
};

export const getCurrentPosition = async (): Promise<any> => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.warn('Permission de localisation refusée. Utilisation de la position par défaut (Dakar).');
    return DEFAULT_LOCATION;
  }

  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve(position);
      },
      (error) => {
        console.warn('Erreur GPS, utilisation de la position par défaut (Dakar):', error.message);
        resolve(DEFAULT_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 },
    );
  });
};
