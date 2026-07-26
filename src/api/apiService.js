import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

/**
 * Firestore data layer.
 *
 * Authorization is enforced by firestore.rules on Google's servers, not here —
 * treat everything in this file as a convenience wrapper, not a security
 * boundary. A modified client can call Firestore directly.
 */

const MAX_RESULTS = 100;

export class ApiError extends Error {
  constructor(message, options) {
    super(message);
    this.name = 'ApiError';
    this.code = options?.code ?? null;
  }
}

function toApiError(error, fallback) {
  if (error?.code === 'permission-denied') {
    return new ApiError('You do not have permission to do that.', { code: error.code });
  }
  if (error?.code === 'unavailable') {
    return new ApiError(
      'Could not reach the server. Check your internet connection and try again.',
      { code: error.code }
    );
  }
  if (error?.code === 'failed-precondition') {
    // Almost always a missing composite index — the console logs a create link.
    return new ApiError(
      'This search is not available yet. Please try a broader filter.',
      { code: error.code }
    );
  }
  return new ApiError(fallback, { code: error?.code });
}

/** Firestore Timestamps do not survive into React state usefully. */
function serialise(snapshot) {
  const data = snapshot.data();
  const plain = { id: snapshot.id };

  for (const [key, value] of Object.entries(data)) {
    plain[key] = value?.toDate ? value.toDate().toISOString() : value;
  }
  return plain;
}

export const apiService = {
  /**
   * Firestore allows only one range/inequality field per query and has no
   * substring matching, so district and bloodGroup are filtered server-side
   * (both exact equality, backed by a composite index) and city is narrowed
   * client-side over that already-small result set.
   */
  async getDonors({ district, city, bloodGroup }) {
    try {
      const constraints = [where('isActive', '==', true)];

      if (district && district !== 'All' && district !== 'All Districts') {
        constraints.push(where('district', '==', district));
      }
      if (bloodGroup && bloodGroup !== 'All' && bloodGroup !== 'All Blood Groups') {
        constraints.push(where('bloodGroup', '==', bloodGroup));
      }

      const snapshot = await getDocs(
        query(collection(db, 'donors'), ...constraints, limit(MAX_RESULTS))
      );

      let donors = snapshot.docs.map(serialise);

      if (city && city.trim()) {
        const needle = city.trim().toLowerCase();
        donors = donors.filter((d) => (d.city || '').toLowerCase().includes(needle));
      }

      return donors;
    } catch (error) {
      throw toApiError(error, 'Could not load donors. Please try again.');
    }
  },

  /**
   * One donor listing per account, keyed by uid — re-registering updates the
   * existing listing instead of creating duplicates.
   */
  async registerDonor(donorData) {
    const user = auth.currentUser;
    if (!user) {
      throw new ApiError('Please sign in before registering as a donor.');
    }

    try {
      const record = {
        ...donorData,
        uid: user.uid,
        isActive: true,
        donationsTotal: donorData.donationsTotal ?? 0,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'donors', user.uid), record, { merge: true });
      return { id: user.uid, ...donorData };
    } catch (error) {
      throw toApiError(error, 'Could not complete registration. Please try again.');
    }
  },

  /** Hide the caller's own listing without deleting their account. */
  async withdrawDonorListing() {
    const user = auth.currentUser;
    if (!user) throw new ApiError('Please sign in first.');

    try {
      await updateDoc(doc(db, 'donors', user.uid), {
        isActive: false,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      throw toApiError(error, 'Could not withdraw your listing. Please try again.');
    }
  },

  async getRequests({ district, bloodGroup }) {
    try {
      const constraints = [where('fulfilled', '==', false)];

      if (district && district !== 'All' && district !== 'All Districts') {
        constraints.push(where('district', '==', district));
      }
      if (bloodGroup && bloodGroup !== 'All' && bloodGroup !== 'All Blood Groups') {
        constraints.push(where('bloodGroup', '==', bloodGroup));
      }

      const snapshot = await getDocs(
        query(
          collection(db, 'requests'),
          ...constraints,
          orderBy('createdAt', 'desc'),
          limit(MAX_RESULTS)
        )
      );

      return snapshot.docs.map(serialise);
    } catch (error) {
      throw toApiError(error, 'Could not load emergency requests. Please try again.');
    }
  },

  async createRequest(requestData) {
    const user = auth.currentUser;
    if (!user) {
      throw new ApiError('Please sign in before posting an emergency request.');
    }

    try {
      const record = {
        ...requestData,
        uid: user.uid,
        fulfilled: false,
        isUrgent: requestData.isUrgent ?? true,
        createdAt: serverTimestamp(),
        dateNeeded: requestData.dateNeeded || new Date().toISOString().split('T')[0],
      };

      const created = await addDoc(collection(db, 'requests'), record);
      return { id: created.id, ...requestData };
    } catch (error) {
      throw toApiError(error, 'Could not post your request. Please try again.');
    }
  },

  /** Only the poster may mark their own request fulfilled (enforced in rules). */
  async fulfillRequest(id) {
    if (!auth.currentUser) throw new ApiError('Please sign in first.');

    try {
      await updateDoc(doc(db, 'requests', id), {
        fulfilled: true,
        fulfilledAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      throw toApiError(error, 'Could not update this request. Please try again.');
    }
  },

  /**
   * Moderation queue. Reports are write-only for ordinary users: rules allow
   * create but not read, so nobody can enumerate who reported what.
   */
  async reportListing({ listingType, listingId, reason }) {
    try {
      await addDoc(collection(db, 'reports'), {
        listingType,
        listingId,
        reason: reason || 'No reason given',
        reportedBy: auth.currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
        status: 'open',
      });
      return true;
    } catch (error) {
      throw toApiError(error, 'Could not send your report. Please try again.');
    }
  },
};
