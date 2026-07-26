import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Firebase surfaces machine-readable codes; users need sentences. Anything
 * unmapped falls through to a generic message rather than leaking internals.
 */
const AUTH_ERROR_MESSAGES = {
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/invalid-email': 'That email address does not look valid.',
  'auth/weak-password': 'Please choose a password of at least 8 characters.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Could not reach the server. Check your internet connection.',
  'auth/requires-recent-login': 'For security, please sign in again before deleting your account.',
};

export class AuthError extends Error {
  constructor(code, fallback = 'Something went wrong. Please try again.') {
    super(AUTH_ERROR_MESSAGES[code] || fallback);
    this.name = 'AuthError';
    this.code = code;
  }
}

function toAuthError(error) {
  return error instanceof AuthError ? error : new AuthError(error?.code, error?.message);
}

export const authService = {
  /** Fires immediately with the restored session, then on every change. */
  subscribe(callback) {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  async register({ email, password, name, district, bloodGroup }) {
    if (!password || password.length < 8) {
      throw new AuthError('auth/weak-password');
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const displayName = name?.trim() || email.split('@')[0];

      await updateProfile(user, { displayName });

      // Profile lives in Firestore; auth only stores credentials.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email.trim().toLowerCase(),
        name: displayName,
        district: district || null,
        bloodGroup: bloodGroup || null,
        createdAt: serverTimestamp(),
      });

      return user;
    } catch (error) {
      throw toAuthError(error);
    }
  },

  async signIn({ email, password }) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      return user;
    } catch (error) {
      throw toAuthError(error);
    }
  },

  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw toAuthError(error);
    }
  },

  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      throw toAuthError(error);
    }
  },

  async getProfile(uid) {
    const snapshot = await getDoc(doc(db, 'users', uid));
    return snapshot.exists() ? snapshot.data() : null;
  },

  /**
   * Permanently delete the account and all associated personal data.
   *
   * Required by App Store Review Guideline 5.1.1(v) and Google Play's account
   * deletion policy: any app offering account creation must offer in-app
   * deletion. Firebase requires a recent login before deleting, so the caller
   * supplies the current password to re-authenticate.
   */
  async deleteAccount(currentPassword) {
    const user = auth.currentUser;
    if (!user) throw new AuthError('auth/user-not-found');

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Remove the donor listing first — once the auth user is gone, the
      // security rules no longer permit writes against their uid.
      await deleteDoc(doc(db, 'donors', user.uid)).catch(() => {});
      await deleteDoc(doc(db, 'users', user.uid)).catch(() => {});

      await deleteUser(user);
    } catch (error) {
      throw toAuthError(error);
    }
  },
};
