@echo off
set ANDROID_PREFS_ROOT=
set ANDROID_USER_HOME=
set ANDROID_SDK_HOME=
set GRADLE_USER_HOME=C:\.g
set USERPROFILE=C:\.g
set HOMEDRIVE=C:
set HOMEPATH=\.g
set PATH=C:\Program Files\nodejs;%PATH%
cd /d Z:\auto-bidder\android
call gradlew.bat assembleRelease --no-daemon
