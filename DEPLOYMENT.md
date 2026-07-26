# Deployment Guide — Bharath Blood Donor

Everything needed to get from this repo to a published app, in order.

> **Status: not yet submittable.** The code is ready; the account setup, hosted
> legal pages, and real donor data are not. Work through Part 1 and Part 5
> before you build anything you intend to upload.

---

## Part 0 — Local setup

```bash
npm install
cp .env.example .env      # then fill in the Firebase values from Part 1
npm start
```

Requirements: Node 20+, and a Google account for Firebase.

---

## Part 1 — Firebase (the backend)

We use the **Spark (free) plan**. It has no time limit, no card required, and —
unlike Supabase's free tier, which pauses a project after 7 days of inactivity —
**Firebase never pauses your project**. That matters for an emergency app that
must answer at 3am during a quiet week.

### 1.1 Create the project

1. Go to <https://console.firebase.google.com> → **Add project**.
2. Name it (e.g. `bharath-blood-donor`).
3. **Disable Google Analytics** — you do not need it, and it adds a consent
   obligation to your privacy policy.

### 1.2 Enable Authentication

1. **Build → Authentication → Get started**.
2. Enable **Email/Password**. Leave "Email link" off.
3. Do **not** enable Phone/SMS sign-in. SMS is billed per message beyond a tiny
   quota and will push you off the free plan.

### 1.3 Create the Firestore database

1. **Build → Firestore Database → Create database**.
2. Start in **production mode** (locked). Our rules replace the defaults.
3. **Choose `asia-south1` (Mumbai)** for lowest latency to AP users.
   **This cannot be changed later** — and the region you pick must be named in
   your privacy policy.

### 1.4 Register the app and get your config

1. Project settings (gear icon) → **Your apps** → **Web** (`</>`).
2. Register with nickname `bharath-blood-donor`.
3. Copy the `firebaseConfig` values into your `.env`.

These values are **not secrets** — they ship inside every Firebase app and are
readable from the APK. Your data is protected by the security rules, not by
hiding this config.

### 1.5 Deploy the security rules

**Do this before anyone uses the app.** The rules in `firestore.rules` are the
only thing standing between your users' phone numbers and the open internet —
the Spark plan has no Cloud Functions, so all authorization lives there.

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # select your project
npm run rules:deploy        # deploys firestore.rules + indexes
```

Index builds run asynchronously — check **Firestore → Indexes** in the console
and wait for "Enabled" before testing filtered searches, or they will fail with
`FAILED_PRECONDITION`.

To test rules locally without touching production data:

```bash
npm run emulators
```

### 1.6 Watch your quotas

Spark gives you 50,000 document reads/day, 20,000 writes/day, 1 GiB stored. A
donor search reads one document per matching donor, so ~500 searches/day over
100 donors would exhaust the read quota. Set a budget alert and watch
**Usage** in the console as you grow. If you exceed it, the app stops serving
until the daily reset.

Note: **Cloud Storage was removed from the Spark plan in 2026**, which is why
this app has no image uploads.

---

## Part 2 — Android (Google Play)

### 2.1 Generate an upload keystore

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore upload-keystore.jks \
  -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

> **Back this file up somewhere permanent and offline.** If you lose it you can
> never publish an update to the same Play listing again. (Play App Signing can
> reset a lost *upload* key, but only if you enrolled — do enrol.)

Create `android/keystore.properties` (already git-ignored):

```properties
storeFile=/absolute/path/to/upload-keystore.jks
storePassword=your-store-password
keyAlias=upload
keyPassword=your-key-password
```

`android/app/build.gradle` picks this up automatically. Without it, release
builds fall back to the debug keystore and log a warning — Play rejects those.

### 2.2 Build the AAB

```bash
npx eas-cli build -p android --profile production
```

Set `EXPO_PUBLIC_API_URL`-style Firebase vars for the build in `eas.json` under
`build.production.env`, or as EAS secrets.

### 2.3 Play Console

1. <https://play.google.com/console> → **Create app** ($25 one-time).
2. Package name: `com.bharathblooddonor.ap` (must match, cannot change later).
3. Complete these, all mandatory:
   - **Privacy policy URL** — the hosted page from Part 5.
   - **Data safety form** — declare: email, name, phone, approximate location,
     and **health info (blood group)**. Declare that data is shared publicly
     with other users, and that users can request deletion in-app.
   - **App access** — give reviewers a working test account; the app is fully
     gated behind sign-in and they will reject it if they cannot get past that.
   - **Content rating** questionnaire.
   - **Target audience** — 18+.
   - **Health apps declaration** — this app is in a health category.
4. Upload the AAB, roll out to **internal testing** first, not production.

---

## Part 3 — iOS (App Store)

You need a Mac with Xcode for local builds, or use EAS cloud builds.

```bash
npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios
```

Fill in the real values in `eas.json` under `submit.production.ios`
(`appleId`, `ascAppId`, `appleTeamId`).

### App Store Connect

- Bundle ID `com.bharathblooddonor.ap`, Category **Medical**.
- **Privacy nutrition labels** — declare Health & Fitness data (blood group),
  Contact Info, and Location. Mark them as linked to identity and publicly
  visible.
- **Demo account** in App Review notes — mandatory, the app is sign-in gated.
- **Age rating 17+** — Medical category apps that surface user-submitted health
  information generally need this.

Guidelines this app is most likely to be judged against:

| Guideline | What it means here |
|---|---|
| 4.2 Minimum functionality | An empty donor directory reads as an incomplete app. See Part 5. |
| 5.1.1(v) Account deletion | Built — About → Your Account → Delete my account. |
| 1.2 User-generated content | Built — report buttons on every listing. **You must actually triage the `reports` collection.** |
| 5.1.1 Data collection | Consent checkbox before publishing a donor listing. |
| 2.3 Accurate metadata | Do not claim donor numbers you do not have. |

---

## Part 4 — Regenerating native folders

`android/` is committed, so EAS builds in "bare" mode and **ignores most of
`app.json`**. Both `app.json` and `android/app/src/main/AndroidManifest.xml`
have been kept in sync by hand.

If you prefer Expo to manage native code (recommended — fewer things to keep in
sync), delete the folder and let prebuild regenerate it:

```bash
rm -rf android
npx expo prebuild --clean --platform android
```

Your `keystore.properties` change would need to be re-applied after that, since
prebuild rewrites `build.gradle`.

---

## Part 5 — What is still blocking submission

These are not code problems. Nothing in the repo can fix them.

- [ ] **Real donors.** The fabricated seed data was removed — publishing
      invented people with real-format Indian phone numbers is both a store
      violation and a privacy risk. You chose to seed by open sign-up: recruit
      **50–100 genuinely consented donors** before submitting, or reviewers see
      an empty app (Apple 4.2).
- [ ] **Host the privacy policy.** Fill in every `[BRACKETED]` field in
      `PRIVACY-POLICY.md`, publish it, and put the real URL in
      `src/constants/legal.js`. Do the same for terms of use.
- [ ] **Verify every helpline number** in `src/screens/AboutAPScreen.js` by
      calling it. Only 108 and 104 are listed, because the previous numbers
      could not be verified — a wrong number in a medical emergency app is
      dangerous. Add more only after confirming each one.
- [ ] **Set up a support email** that a human reads. Both stores require it.
- [ ] **Assign someone to moderate the `reports` collection.** Apple requires
      user-generated content to be actually moderated, not just reportable.
- [ ] **Decide your abuse response.** A public directory of phone numbers
      attracts spam and harassment. Know in advance how you will remove a bad
      actor and how quickly.
- [ ] **Add crash reporting** (Sentry has a free tier) — wire it into
      `ErrorBoundary.componentDidCatch`.
- [ ] **Test on a real low-end Android device** on a slow connection, which is
      what most of your users will have.

---

## Troubleshooting

**"Missing or insufficient permissions"** — rules not deployed, or you are
signed out. Run `npm run rules:deploy`.

**Filtered search returns an error** — a composite index is still building.
Check Firestore → Indexes.

**Signed out on every app restart** — AsyncStorage persistence failed; check
`src/config/firebase.js`.

**Release build rejected by Play as debug-signed** — `android/keystore.properties`
is missing. See 2.1.
