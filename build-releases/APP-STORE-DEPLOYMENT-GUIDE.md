# Apple App Store Deployment Guide — Bharath Blood Donor AP

This guide provides instructions to deploy **Bharath Blood Donor (Andhra Pradesh)** to the Apple App Store.

## 📋 Pre-requisites
- Apple Developer Account ($99/year).
- Bundle Identifier: `com.bharathblooddonor.ap` (configured in `app.json` & `ios/` native config).

---

## 🛠️ Step 1: Generate iOS Production IPA Binary

Run double-click on `BUILD-COMMANDS.bat` and select Option **[4]**, OR run this command in terminal:

```bash
cd /d D:\app
npx eas-cli build -p ios --profile production
```

This builds the signed `.ipa` package ready for Apple App Store Connect submission.

---

## 🚀 Step 2: Upload to Apple App Store Connect

1. Log in to [App Store Connect](https://appstoreconnect.apple.com).
2. Click **My Apps** -> **+ New App**:
   - **Platforms**: iOS
   - **Name**: Bharath Blood Donor - AP
   - **Primary Language**: English
   - **Bundle ID**: `com.bharathblooddonor.ap`
   - **SKU**: `bharath-blood-donor-ap-001`
3. Upload the compiled `.ipa` via **Transporter App** or Xcode / EAS CLI submit:
   ```bash
   npx eas-cli submit -p ios
   ```
4. Fill in App Store Metadata:
   - Category: Medical / Health & Fitness
   - Age Rating: 4+
   - Privacy Policy URL & Support Info
5. Submit for Review!
