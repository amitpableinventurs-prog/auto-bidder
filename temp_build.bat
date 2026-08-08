@echo off
set ANDROID_PREFS_ROOT=C:\.g
set ANDROID_USER_HOME=C:\.g
set ANDROID_SDK_HOME=C:\.g
set GRADLE_USER_HOME=C:\.g
set USERPROFILE=C:\.g
set HOMEDRIVE=C:
set HOMEPATH=\.g
set JAVA_OPTS=-Duser.home=C:\.g
cd /d Z:\auto-bidder\android
call gradlew.bat assembleRelease --no-daemon -Duser.home=C:\.g
