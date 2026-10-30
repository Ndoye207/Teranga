/**
 * Drapeau partagé entre authService et useAuthStore.
 * Pendant la réinitialisation du mot de passe, verifyOtp ouvre une session
 * temporaire : on empêche le store de « connecter » l'utilisateur dans l'appli.
 */
export const authFlags = { recovering: false };
