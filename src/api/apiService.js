import {
  collection,
  doc,
  getDoc,
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
import {
  evaluateDonorStatus,
  calculateCooldownUntil,
  DEFAULT_COOLDOWN_SETTINGS,
  formatReadableDate,
} from '../utils/cooldown';

/**
 * Firestore data layer for Bharath Blood Donor.
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
    return new ApiError(
      'This search is not available yet. Please try a broader filter.',
      { code: error.code }
    );
  }
  return new ApiError(fallback, { code: error?.code });
}

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
   * Central configuration loader for donation cooldown settings.
   */
  async getDonationSettings() {
    try {
      const snap = await getDoc(doc(db, 'config', 'donationSettings'));
      if (snap.exists()) {
        const data = snap.data();
        return {
          maleCooldownMonths: Number(data.maleCooldownMonths) || DEFAULT_COOLDOWN_SETTINGS.maleCooldownMonths,
          femaleCooldownMonths: Number(data.femaleCooldownMonths) || DEFAULT_COOLDOWN_SETTINGS.femaleCooldownMonths,
        };
      }
      return DEFAULT_COOLDOWN_SETTINGS;
    } catch (e) {
      return DEFAULT_COOLDOWN_SETTINGS;
    }
  },

  /**
   * Save central admin donation settings.
   */
  async updateDonationSettings(settings) {
    if (!auth.currentUser) throw new ApiError('Please sign in first.');
    try {
      const payload = {
        maleCooldownMonths: Number(settings.maleCooldownMonths) || 3,
        femaleCooldownMonths: Number(settings.femaleCooldownMonths) || 4,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid,
      };
      await setDoc(doc(db, 'config', 'donationSettings'), payload, { merge: true });
      return payload;
    } catch (error) {
      throw toApiError(error, 'Could not update donation settings.');
    }
  },

  /**
   * Donor Search: Returns ONLY currently AVAILABLE donors.
   * Donors in DONATION_COOLDOWN, INACTIVE, or SUSPENDED are strictly excluded.
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

      // Strict Cooldown & Availability Filter
      donors = donors.filter((d) => evaluateDonorStatus(d) === 'AVAILABLE');

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
   * Backend Validation: Checks if donor can accept a new blood request.
   */
  async canDonorAcceptRequest(donorId) {
    if (!donorId) return { allowed: false, message: 'Invalid donor account.' };

    try {
      const donorSnap = await getDoc(doc(db, 'donors', donorId));
      if (!donorSnap.exists()) {
        return { allowed: false, message: 'Donor account not found.' };
      }

      const donor = donorSnap.data();
      const status = evaluateDonorStatus(donor);

      if (status === 'SUSPENDED') {
        return { allowed: false, message: 'This donor account is suspended.' };
      }

      if (status === 'DONATION_COOLDOWN') {
        const untilDate = formatReadableDate(donor.cooldownUntil);
        return {
          allowed: false,
          message: `You are currently unavailable because you recently donated blood. You can donate again after ${untilDate}.`,
        };
      }

      return { allowed: true };
    } catch (e) {
      return { allowed: true };
    }
  },

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
        status: 'AVAILABLE',
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

  async withdrawDonorListing() {
    const user = auth.currentUser;
    if (!user) throw new ApiError('Please sign in first.');

    try {
      await updateDoc(doc(db, 'donors', user.uid), {
        isActive: false,
        status: 'INACTIVE',
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      throw toApiError(error, 'Could not withdraw your listing. Please try again.');
    }
  },

  /**
   * Confirms a donation and puts the donor into DONATION_COOLDOWN status.
   */
  async recordDonation({ donorId, donorGender, bloodGroup, donationDate, requestId, notes, confirmedBy }) {
    if (!auth.currentUser) throw new ApiError('Please sign in first.');

    const targetDonorId = donorId || auth.currentUser.uid;
    const dDate = donationDate || new Date().toISOString().split('T')[0];

    try {
      // Fetch donor profile for gender and existing total
      const donorRef = doc(db, 'donors', targetDonorId);
      const donorSnap = await getDoc(donorRef);
      const donorData = donorSnap.exists() ? donorSnap.data() : {};

      const gender = donorGender || donorData.gender || 'MALE';
      const bGroup = bloodGroup || donorData.bloodGroup || 'O+';

      // Load configurable settings
      const settings = await this.getDonationSettings();
      const cooldownMonths = gender.toUpperCase() === 'FEMALE' ? settings.femaleCooldownMonths : settings.maleCooldownMonths;
      const cooldownUntil = calculateCooldownUntil(dDate, gender, settings.maleCooldownMonths, settings.femaleCooldownMonths);

      const donationRecord = {
        donorId: targetDonorId,
        donorGender: gender,
        bloodGroup: bGroup,
        donationDate: dDate,
        cooldownMonths,
        cooldownUntil,
        status: 'DONATION_COOLDOWN',
        requestId: requestId || null,
        notes: notes || '',
        confirmedBy: confirmedBy || auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'donations'), donationRecord);

      // Update donor record to DONATION_COOLDOWN state
      const existingTotal = Number(donorData.donationsTotal) || 0;
      await setDoc(
        donorRef,
        {
          status: 'DONATION_COOLDOWN',
          cooldownUntil,
          cooldownMonths,
          lastDonatedDate: dDate,
          isActive: false,
          donationsTotal: existingTotal + 1,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Also mirror onto user document
      await setDoc(
        doc(db, 'users', targetDonorId),
        { status: 'DONATION_COOLDOWN', cooldownUntil, updatedAt: serverTimestamp() },
        { merge: true }
      );

      return { id: docRef.id, ...donationRecord };
    } catch (error) {
      throw toApiError(error, 'Could not record donation completion.');
    }
  },

  /**
   * Retrieves full donation history for a donor.
   */
  async getDonationHistory(donorId) {
    if (!auth.currentUser) return [];
    const targetUid = donorId || auth.currentUser.uid;

    try {
      const q = query(
        collection(db, 'donations'),
        where('donorId', '==', targetUid),
        orderBy('createdAt', 'desc'),
        limit(MAX_RESULTS)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(serialise);
    } catch (error) {
      // Fallback if index is missing or permissions fail
      try {
        const fallbackQ = query(
          collection(db, 'donations'),
          where('donorId', '==', targetUid),
          limit(MAX_RESULTS)
        );
        const snapshot = await getDocs(fallbackQ);
        return snapshot.docs.map(serialise).sort((a, b) => new Date(b.donationDate || 0) - new Date(a.donationDate || 0));
      } catch (e) {
        return [];
      }
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

  /**
   * Fulfills blood request and creates a confirmed donation record for the donor.
   */
  async fulfillRequestWithDonor({ requestId, donorId, notes }) {
    if (!auth.currentUser) throw new ApiError('Please sign in first.');

    try {
      await updateDoc(doc(db, 'requests', requestId), {
        fulfilled: true,
        fulfilledAt: serverTimestamp(),
        confirmedDonorId: donorId || null,
        confirmedAt: serverTimestamp(),
      });

      if (donorId) {
        const reqSnap = await getDoc(doc(db, 'requests', requestId));
        const reqData = reqSnap.exists() ? reqSnap.data() : {};

        await this.recordDonation({
          donorId,
          bloodGroup: reqData.bloodGroup,
          donationDate: new Date().toISOString().split('T')[0],
          requestId,
          notes: notes || `Donated for ${reqData.patientName || 'emergency request'}`,
          confirmedBy: auth.currentUser.uid,
        });
      }

      return true;
    } catch (error) {
      throw toApiError(error, 'Could not mark request as completed.');
    }
  },

  async fulfillRequest(id) {
    return this.fulfillRequestWithDonor({ requestId: id });
  },

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

  /**
   * Admin dashboard: Retrieves all donors with dynamic status evaluation.
   */
  async getAdminDonorsList() {
    if (!auth.currentUser) throw new ApiError('Please sign in first.');
    try {
      const snapshot = await getDocs(collection(db, 'donors'));
      const list = snapshot.docs.map(serialise);

      return list.map((d) => ({
        ...d,
        evaluatedStatus: evaluateDonorStatus(d),
      }));
    } catch (error) {
      throw toApiError(error, 'Could not fetch admin donor list.');
    }
  },
};
