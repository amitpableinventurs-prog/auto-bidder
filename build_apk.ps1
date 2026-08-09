$env:ANDROID_PREFS_ROOT = $null
cd apps/mobile/android
./gradlew clean
./gradlew assembleRelease --stacktrace --info > ../../../build_log.txt 2>&1
