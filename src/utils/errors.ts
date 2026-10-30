import { Alert } from 'react-native';

/** Message lisible pour l'utilisateur à partir d'une erreur Supabase / réseau. */
export function getErrorMessage(error: any, fallback = 'Une erreur est survenue.'): string {
  const message: string = error?.message ?? '';
  if (/network request failed|failed to fetch/i.test(message)) {
    return 'Connexion impossible. Vérifiez votre connexion internet.';
  }
  if (/permission denied|row-level security/i.test(message)) {
    return "Vous n'avez pas le droit d'effectuer cette action.";
  }
  return message || fallback;
}

/** Journalise ET informe l'utilisateur (plus de catch muet). */
export function showError(title: string, error: any, fallback?: string) {
  console.error(title, error);
  Alert.alert(title, getErrorMessage(error, fallback));
}
