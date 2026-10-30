import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

// Le sélecteur renvoie l'image en base64 en plus de son adresse (uri).
// On garde le base64 en mémoire le temps de l'envoi : c'est la méthode la plus fiable
// pour envoyer une image vers Supabase Storage depuis React Native (surtout sur émulateur).
const base64Cache = new Map<string, string>();

type PickOptions = { quality?: number; maxWidth?: number; maxHeight?: number };

/** Ouvre la galerie et renvoie l'uri de l'image choisie (ou null si annulé / erreur). */
export async function pickPhoto(opts: PickOptions = {}): Promise<string | null> {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    includeBase64: true,
    quality: (opts.quality ?? 0.7) as any,
    maxWidth: opts.maxWidth,
    maxHeight: opts.maxHeight,
  });

  if (result.didCancel) return null;
  if (result.errorCode) {
    Alert.alert('Erreur', result.errorMessage || "Impossible d'ouvrir la galerie.");
    return null;
  }

  const asset = result.assets?.[0];
  if (!asset?.uri) return null;
  if (asset.base64) base64Cache.set(asset.uri, asset.base64);
  return asset.uri;
}

export const getPickedBase64 = (uri: string): string | undefined => base64Cache.get(uri);
export const releasePicked = (uri: string): void => { base64Cache.delete(uri); };
