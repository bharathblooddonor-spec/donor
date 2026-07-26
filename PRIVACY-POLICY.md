# Privacy Policy — Bharath Blood Donor

**Last updated: [DATE BEFORE YOU PUBLISH]**

> **Before submitting to the stores:** publish this as a public web page (GitHub
> Pages works and is free), then replace the placeholder URLs in
> `src/constants/legal.js` with the real link. Fill in every `[BRACKETED]` field
> below — an incomplete policy is itself a rejection reason. If you operate in
> the EU or process EU residents' data, have a lawyer review this first; this is
> a starting template, not legal advice.

---

## Who we are

Bharath Blood Donor ("the app") is a free, non-commercial service that helps
voluntary blood donors and patients in Andhra Pradesh, India contact each other.

**Operated by:** [YOUR NAME OR REGISTERED ORGANISATION]
**Contact:** [YOUR SUPPORT EMAIL]
**Address:** [YOUR POSTAL ADDRESS]

We are the data fiduciary for the purposes of India's Digital Personal Data
Protection Act, 2023.

---

## What we collect

### When you create an account
- Email address
- Password (stored only as a cryptographic hash by Firebase Authentication — we
  never see or store your actual password)
- Display name
- Your district and blood group, if you provide them

### When you list yourself as a donor
Listing is entirely optional and separate from creating an account. If you
choose to list, we collect and **publish**:
- Name
- Age and gender
- **Blood group**
- District and city
- Phone number
- Availability status and last donation period

### When you post an emergency request
- Patient name, blood group, units needed
- Hospital name and location
- Contact name and phone number
- Reason for the request

### Automatically
- Approximate location, **only** when you tap "Use my current location". We use
  it once to identify your district and city, and we discard it immediately. We
  never store your coordinates and never track you in the background.

We do **not** collect analytics, advertising identifiers, or browsing activity.
We do **not** use cookies or third-party trackers. We do **not** sell or rent
your data to anyone, ever.

---

## Sensitive personal data

Your **blood group is health data**. Under the DPDP Act 2023 and the EU GDPR
(Article 9), this is a special category of personal data requiring your explicit
consent.

We ask for that consent with a specific, unticked checkbox before you are listed
as a donor. Creating an account alone never publishes anything about you. You
can withdraw consent at any time (see "Your rights" below).

---

## Who can see your information

| Data | Who can see it |
|---|---|
| Your email address | Only you |
| Your account profile | Only you |
| Your donor listing | Any signed-in app user searching for donors |
| Your emergency request | Any signed-in app user |
| Your reports of bad listings | Only our moderation team |

Donor listings and emergency requests are visible to **all signed-in users** —
that is the purpose of the app. We require sign-in specifically so that donor
phone numbers cannot be harvested anonymously in bulk.

**Understand the trade-off before you list:** a published phone number can be
called by anyone with an account, including people acting in bad faith. Only
list yourself if you accept that.

---

## Where your data is stored

We use **Google Firebase** (Firebase Authentication and Cloud Firestore).
Your data is stored on Google Cloud infrastructure in
**[YOUR FIRESTORE REGION — e.g. asia-south1, Mumbai]**.

Google processes this data as our sub-processor under their
[Data Processing Terms](https://firebase.google.com/terms/data-processing-terms).
If your Firestore region is outside India, that constitutes a cross-border
transfer and you must say so explicitly here.

---

## How long we keep it

- **Account data:** until you delete your account.
- **Donor listings:** until you hide the listing or delete your account.
- **Emergency requests:** [YOUR RETENTION PERIOD — we recommend auto-removal
  30 days after the date needed] .
- **Abuse reports:** [YOUR RETENTION PERIOD] , to detect repeat offenders.

When you delete your account, your profile and donor listing are deleted
immediately and permanently.

---

## Your rights

You can, at any time, from inside the app:

- **See** everything we hold about you (it is all shown on your own screens).
- **Correct** it by editing your listing.
- **Hide your donor listing** — About → Your Account → Hide my donor listing.
  This withdraws your consent to publication while keeping your account.
- **Delete your account and all associated data** — About → Your Account →
  Delete my account. This is permanent and immediate.

To exercise any right we have not built into the app, or to complain, email
**[YOUR SUPPORT EMAIL]**. We respond within [YOUR SLA — e.g. 30 days].

Under the DPDP Act you may also nominate someone to exercise these rights on
your behalf if you die or become incapacitated, and you may complain to the Data
Protection Board of India.

---

## Children

This app is not intended for anyone under 18. Blood donation in India is
restricted to people aged 18–65, and the app enforces that. We do not knowingly
collect data from children. If you believe a child has registered, email us and
we will delete the account.

---

## Security

- Passwords are hashed by Firebase Authentication; we never store plaintext.
- All traffic uses HTTPS/TLS.
- Access is enforced server-side by Firestore Security Rules, not by the app.
- Reading donor listings requires a signed-in account.

No system is perfectly secure. Anything published in a donor listing should be
treated as public information.

---

## This app is not medical care

Bharath Blood Donor does not provide medical advice and is not a blood bank. We
do not verify or medically screen donors — all listing details are self-reported.
All blood must be collected and tested at a licensed blood bank. **In an
emergency, call 108.**

---

## Changes

If we change this policy materially we will notify you in the app before the
change takes effect. The "last updated" date above always reflects the current
version.
