@echo off
set GRADLE_OPTS=-Dandroid.prefs.root=C:\.g -Dandroid.user.home=C:\.g -Duser.home=C:\.g
set ANDROID_PREFS_ROOT=C:\.g
set ANDROID_USER_HOME=C:\.g
set GRADLE_USER_HOME=C:\.g
set USERPROFILE=C:\.g
set HOMEDRIVE=C:
set HOMEPATH=\.g
set PATH=C:\Program Files\nodejs;%PATH%
cd /d Z:\auto-bidder\android
call gradlew.bat assembleRelease --no-daemon
