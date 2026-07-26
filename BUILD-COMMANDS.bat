@echo off
set PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%
title Bharath Blood Donor - Native App Build Script
echo ========================================================
echo   BHARATH BLOOD DONOR (AP) - NATIVE BUILD GENERATOR
echo ========================================================
echo.
echo Select the build type you want to generate:
echo.
echo [1] Build Android Debug APK (for testing on Android phones)
echo [2] Build Android Production AAB (for Google Play Store upload)
echo [3] Build Android Release APK (standalone installer APK)
echo [4] Build iOS IPA via Expo EAS (for Apple App Store upload)
echo [5] Exit
echo.

set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto build_apk
if "%choice%"=="2" goto build_aab
if "%choice%"=="3" goto build_release_apk
if "%choice%"=="4" goto build_ipa
if "%choice%"=="5" goto end

:build_apk
echo.
echo Building Android Debug APK...
set JAVA_HOME=C:\Program Files\Java\jdk-17
cd /d %~dp0android
call gradlew.bat assembleDebug
copy %~dp0android\app\build\outputs\apk\debug\app-debug.apk %~dp0android-debug.apk /Y
echo.
echo SUCCESS! Output saved to: %~dp0android-debug.apk
pause
goto end

:build_aab
echo.
echo Building Android Production App Bundle (.aab)...
set JAVA_HOME=C:\Program Files\Java\jdk-17
cd /d %~dp0android
call gradlew.bat bundleRelease
copy %~dp0android\app\build\outputs\bundle\release\app-release.aab %~dp0android-release.aab /Y
echo.
echo SUCCESS! Output saved to: %~dp0android-release.aab
pause
goto end

:build_release_apk
echo.
echo Building Android Release APK...
set JAVA_HOME=C:\Program Files\Java\jdk-17
cd /d %~dp0android
call gradlew.bat assembleRelease
copy %~dp0android\app\build\outputs\apk\release\app-release.apk %~dp0android-release.apk /Y
echo.
echo SUCCESS! Output saved to: %~dp0android-release.apk
pause
goto end

:build_ipa
echo.
echo Building iOS IPA via Expo EAS Cloud...
cd /d %~dp0..
call npx eas-cli build -p ios --profile production
pause
goto end

:end
echo Thank you!
