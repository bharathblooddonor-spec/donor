import * as Location from 'expo-location';
import { apDistricts, apCitiesByDistrict } from '../data/apData';

/** Strip punctuation/case so "Dr. B.R. Ambedkar Konaseema" matches "Ambedkar Konaseema". */
function normalise(value) {
  return (value || '').toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Reverse-geocoded place names rarely match our district list exactly — the OS
 * may return "Krishna District", "NTR", or the old pre-2022 name. Try the
 * candidate fields in order of reliability and accept a containment match.
 */
function matchDistrict(candidates) {
  const normalisedCandidates = candidates.filter(Boolean).map(normalise);

  for (const candidate of normalisedCandidates) {
    const exact = apDistricts.find((d) => normalise(d) === candidate);
    if (exact) return exact;
  }

  for (const candidate of normalisedCandidates) {
    const partial = apDistricts.find(
      (d) => candidate.includes(normalise(d)) || normalise(d).includes(candidate)
    );
    if (partial) return partial;
  }

  return null;
}

function matchCity(district, candidates) {
  const cities = apCitiesByDistrict[district] || [];
  const normalisedCandidates = candidates.filter(Boolean).map(normalise);

  for (const candidate of normalisedCandidates) {
    const hit = cities.find(
      (c) => normalise(c) === candidate || normalise(c).includes(candidate) || candidate.includes(normalise(c))
    );
    if (hit) return hit;
  }

  return cities[0] || null;
}

export class LocationError extends Error {
  constructor(message, { isPermissionDenied = false } = {}) {
    super(message);
    this.name = 'LocationError';
    this.isPermissionDenied = isPermissionDenied;
  }
}

/**
 * Ask for foreground location permission, resolve the device position, and map
 * it onto an AP district/city. Returns { district, city, label }.
 *
 * Coordinates are used in-memory only — they are never persisted or sent to the
 * backend, which is what the permission strings in app.json promise.
 */
export async function detectDistrictAndCity() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new LocationError(
      'Location permission was denied. You can still pick your district and city manually.',
      { isPermissionDenied: true }
    );
  }

  let position;
  try {
    position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
  } catch {
    throw new LocationError(
      'Could not get a GPS fix. Make sure location is switched on, or pick your district manually.'
    );
  }

  const { latitude, longitude } = position.coords;

  let places = [];
  try {
    places = await Location.reverseGeocodeAsync({ latitude, longitude });
  } catch {
    throw new LocationError(
      'Found your position but could not identify the area. Please pick your district manually.'
    );
  }

  const place = places[0];
  if (!place) {
    throw new LocationError(
      'Found your position but could not identify the area. Please pick your district manually.'
    );
  }

  const district = matchDistrict([place.subregion, place.district, place.city, place.region]);

  if (!district) {
    throw new LocationError(
      'You appear to be outside Andhra Pradesh. Please pick a district manually.'
    );
  }

  const city = matchCity(district, [place.city, place.district, place.name, place.subregion]);

  return {
    district,
    city,
    label: city ? `Detected: ${city}, ${district} district` : `Detected: ${district} district`,
  };
}
