# Deployment Guide — Bharath Blood Donor

Everything needed to get from this repo to a published app, in order.

> **Status: Android builds; iOS needs your Apple login; not yet submittable.**
> Firebase is live, security rules are deployed, legal pages are published, and
> a signed production AAB has been built. The one thing standing between this
> and a submission is **real donor data** — see Part 5.

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

### 2.1 Signing — already done

EAS generated an upload keystore when the first build ran and stores it against
the project. You do **not** need `keytool`, and there is no `keystore.properties`
to manage.

> **Back it up anyway.** If the keystore is lost you can never publish an update
> to the same Play listing again:
>
> ```bash
> npx eas-cli credentials -p android      # → Download keystore
> ```
>
> Keep the downloaded file offline. Also enrol in **Play App Signing** during
> Play Console setup — it is the only route to recovering a lost upload key.

### 2.2 Build the AAB

```bash
npm run eas:build:android:aab      # or: npx eas-cli build -p android --profile production
```

Firebase config is already wired into `eas.json` under each profile's `env`.
EAS builds run on Expo's servers and never see your local `.env`, so anything
the app reads at runtime has to live there (or as an EAS secret). The values in
`eas.json` are Firebase web config, which is public by design — never add a
service account key.

`autoIncrement` is on for the production profile, so `versionCode` bumps itself
on every build. Play rejects a re-used `versionCode`.

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

**This step must be run by you, interactively.** EAS needs to sign in to your
Apple Developer account and prompts for your Apple ID plus a 2FA code, so it
cannot run unattended:

```bash
npx eas-cli build -p ios --profile production
```

It will ask, in order:

1. Apple ID email and password
2. The 6-digit 2FA code sent to your Apple devices
3. Which team to use (if you belong to more than one)
4. Whether to create a Distribution Certificate and Provisioning Profile —
   answer **yes**; EAS generates and stores both for you

Only the first build asks. Afterwards the credentials live on the EAS server and
later builds are non-interactive.

Then, to submit:

```bash
npx eas-cli submit -p ios
```

Fill in the real values in `eas.json` under `submit.production.ios`
(`appleId`, `ascAppId`, `appleTeamId`) first.

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

## Part 4 — Native folders

`android/` and `ios/` are **not committed** — they are generated from `app.json`
by `npx expo prebuild`, which EAS runs for you on every build.

This is deliberate. When those folders exist in the repo, EAS Build ignores
`app.json` for icon, splash, plugins, and **permissions** — so the two silently
drift apart and your permission cleanup never reaches the built app. Keeping
them out means `app.json` is the single source of truth for both platforms.

To inspect what EAS will generate, without committing it:

```bash
npx expo prebuild --clean        # creates android/ and ios/ locally (git-ignored)
```

## Part 5 — What is still blocking submission

**Done:** Firebase project live in `asia-south1`; security rules and composite
indexes deployed; privacy policy, terms, and support page published and linked
in-app; upload keystore generated and held by EAS; signed production AAB built;
reviewer test account created.

Still outstanding — none of these are code problems:

- [ ] **Real donors. This is the blocker.** The database is empty, so a reviewer
      signing in sees "0 Found". For a Medical-category app that reads as
      non-functional (Apple 4.2). You chose to seed by open sign-up: recruit
      **50–100 genuinely consented donors** before submitting. Nothing in the
      repo can substitute for this, and shipping invented donors with
      real-format phone numbers is both a store violation and a privacy risk.
- [ ] **Verify the helplines** in `src/screens/AboutAPScreen.js` by calling
      them. Only 108 and 104 are listed, because the previous numbers could not
      be verified. A wrong number in a medical emergency app is dangerous.
- [ ] **Back up the EAS keystore** — `npx eas-cli credentials -p android`, then
      store it offline. Lose it and you can never update the Play listing.
- [ ] **Assign someone to triage the `reports` collection.** Apple requires
      user-generated content to be actually moderated, not merely reportable.
      Reports are write-only by design — read them in the Firebase console.
- [ ] **Decide your abuse response** before launch. A public directory of phone
      numbers attracts spam and harassment. Know how you remove a bad actor and
      how fast — the Support page publicly promises 24 hours.
- [ ] **Add crash reporting** (Sentry has a free tier) — wire it into
      `ErrorBoundary.componentDidCatch`, which currently only logs to console.
- [ ] **Test on a real low-end Android phone** on a slow connection. That is
      what most of your users will have, and the emulator hides nothing about
      jank but everything about network reality.

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
