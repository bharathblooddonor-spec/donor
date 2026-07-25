# Google Play Store Deployment Guide — Bharath Blood Donor AP

This guide provides step-by-step instructions to deploy **Bharath Blood Donor (Andhra Pradesh)** to the Google Play Store.

## 📋 Pre-requisites
- Google Play Developer Account ($25 one-time fee).
- Package Name: `com.bharathblooddonor.ap` (already configured in `app.json` & `android/app/build.gradle`).

---

## 🛠️ Step 1: Generate Android Release AAB File

Run double-click on `BUILD-COMMANDS.bat` and select Option **[2]**, OR run this command in terminal:

```bash
cd /d D:\app\android
set JAVA_HOME=C:\Program Files\Amazon Corretto\jdk11.0.32_9
gradlew.bat bundleRelease
```

The output file will be saved at:
`D:\app\build-releases\android-release.aab`

---

## 🚀 Step 2: Upload to Google Play Console

1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - **App name**: Bharath Blood Donor - AP
   - **Default language**: English (United States) or English (India)
   - **App or game**: App
   - **Free or paid**: Free
3. Navigate to **Production** under the Release section on the left menu.
4. Click **Create new release**.
5. Upload `android-release.aab` from `D:\app\build-releases\android-release.aab`.
6. Add Release Notes:
   > "Bharath Blood Donor AP - Emergency Blood Donor network for Andhra Pradesh connecting patients, hospitals, and donors across 26 AP districts in real-time."
7. Complete Store Listing:
   - Short Description: "Fast emergency blood donor finder across Andhra Pradesh."
   - Full Description: Include features like Vijayawada fast-track, 19 blood groups (including Bombay Phenotype & Rh-null Golden), emergency board, and voluntary donation notice.
   - Upload Logo ([`assets/logo.png`](file:///D:/app/assets/logo.png)), Feature Graphic, and Screenshots.
8. Click **Review Release** and **Start rollout to Production**!
