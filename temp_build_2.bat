@echo off
set ANDROID_PREFS_ROOT=
set ANDROID_USER_HOME=C:\.g
set GRADLE_USER_HOME=C:\.g
echo ANDROID_USER_HOME is %ANDROID_USER_HOME%
cd /d Z:\auto-bidder\android
call gradlew.bat assembleRelease --no-daemon
