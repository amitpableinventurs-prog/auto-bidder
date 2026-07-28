@echo off
set ANDROID_PREFS_ROOT=
cd android
call gradlew clean assembleRelease --stacktrace --info
