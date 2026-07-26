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
  GoogleAuthProvider,
  signInWithPopup,
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
  'auth/popup-closed-by-user': 'Google sign in popup was closed before completing.',
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

  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Sync or create profile document in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email ? user.email.toLowerCase() : '',
          name: user.displayName || 'Google User',
          photoURL: user.photoURL || null,
          createdAt: serverTimestamp(),
        });
      }

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

  async updateUserProfile(profileData) {
    const user = auth.currentUser;
    if (!user) throw new AuthError('auth/user-not-found');

    try {
      const { name, photoURL, phone, district, city, bloodGroup, age, availableToDonate } = profileData;

      // 1. Update Auth profile
      if (name || photoURL) {
        await updateProfile(user, {
          displayName: name || user.displayName,
          photoURL: photoURL !== undefined ? photoURL : user.photoURL,
        });
      }

      // 2. Update Firestore users doc
      const userDocData = {
        name: name || user.displayName,
        updatedAt: serverTimestamp(),
      };
      if (photoURL !== undefined) userDocData.photoURL = photoURL;
      if (phone) userDocData.phone = phone;
      if (district) userDocData.district = district;
      if (city) userDocData.city = city;
      if (bloodGroup) userDocData.bloodGroup = bloodGroup;

      await setDoc(doc(db, 'users', user.uid), userDocData, { merge: true });

      // 3. Update Firestore donors doc if exists or created
      const donorRef = doc(db, 'donors', user.uid);
      const donorSnap = await getDoc(donorRef);

      if (donorSnap.exists()) {
        const donorUpdate = {
          name: name || user.displayName,
          updatedAt: serverTimestamp(),
        };
        if (photoURL !== undefined) donorUpdate.photoURL = photoURL;
        if (phone) donorUpdate.phone = phone;
        if (district) donorUpdate.district = district;
        if (city) donorUpdate.city = city;
        if (bloodGroup) donorUpdate.bloodGroup = bloodGroup;
        if (age) donorUpdate.age = Number(age);
        if (availableToDonate !== undefined) donorUpdate.isActive = Boolean(availableToDonate);

        await setDoc(donorRef, donorUpdate, { merge: true });
      }

      return user;
    } catch (error) {
      throw toAuthError(error);
    }
  },

  /**
   * Permanently delete the account and all associated personal data.
   */
  async deleteAccount(currentPassword) {
    const user = auth.currentUser;
    if (!user) throw new AuthError('auth/user-not-found');

    try {
      if (user.email && currentPassword) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

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

