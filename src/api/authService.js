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

/**
 * Keep only the fields the user actually filled in. A blank input must leave
 * the stored value alone rather than overwrite it with an empty string, which
 * would fail the donor validation rules on the next write.
 */
function pickProvided(fields) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
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
   * The public donor listing, or null if the user has never registered as one.
   *
   * `age` and `isActive` live here rather than on the private profile, so any
   * screen that edits them has to read them from here too — reading them off
   * `users` silently yields undefined and the field resets to its default.
   */
  async getDonorProfile(uid) {
    const snapshot = await getDoc(doc(db, 'donors', uid));
    return snapshot.exists() ? snapshot.data() : null;
  },

  /**
   * Save the profile sheet. Returns `{ user, donorListingUpdated }` — callers
   * must not report the donor-only fields as saved when there is no listing to
   * save them to.
   */
  async updateUserProfile(profileData) {
    const user = auth.currentUser;
    if (!user) throw new AuthError('auth/user-not-found');

    const { name, photoURL, phone, district, city, bloodGroup, age, availableToDonate } = profileData;
    const displayName = name || user.displayName;

    try {
      await updateProfile(user, {
        displayName,
        photoURL: photoURL !== undefined ? photoURL : user.photoURL,
      });

      // Fields common to the private profile and the public listing.
      const shared = pickProvided({ phone, district, city, bloodGroup });
      if (photoURL !== undefined) shared.photoURL = photoURL;

      // uid and email are required by the users/ create rule. They are
      // unchanged on every normal save, but including them means a merge onto
      // a missing document still passes validation instead of being denied.
      await setDoc(
        doc(db, 'users', user.uid),
        { ...shared, uid: user.uid, email: user.email, name: displayName, updatedAt: serverTimestamp() },
        { merge: true },
      );

      // The listing is deliberately never created here. Publishing a blood
      // group is health data and needs the explicit consent collected on the
      // Be a Donor screen — not a toggle inside a profile sheet.
      const donorRef = doc(db, 'donors', user.uid);
      const donorListingUpdated = (await getDoc(donorRef)).exists();

      if (donorListingUpdated) {
        const donorUpdate = { ...shared, name: displayName, updatedAt: serverTimestamp() };
        if (age) donorUpdate.age = Number(age);
        if (availableToDonate !== undefined) donorUpdate.isActive = Boolean(availableToDonate);

        await setDoc(donorRef, donorUpdate, { merge: true });
      }

      return { user, donorListingUpdated };
    } catch (error) {
      throw toAuthError(error);
    }
  },

  /**
   * Permanently delete the account and all associated personal data.
   *
   * Required by App Store Review Guideline 5.1.1(v) and Google Play's account
   * deletion policy: any app offering account creation must offer in-app
   * deletion. Firebase requires a recent login before deleting, so password
   * users re-authenticate here. Google-provider users have no password to
   * supply — they fall through and rely on the session still being recent,
   * surfacing 'auth/requires-recent-login' if it is not.
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

