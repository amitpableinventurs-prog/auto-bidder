@echo off
set "ANDROID_USER_HOME=C:\android_home"
set "ANDROID_PREFS_ROOT=C:\android_home"
set "HOME=C:\android_home"
set "USERPROFILE=C:\android_home"
if not exist "C:\android_home" mkdir "C:\android_home"
call gradlew.bat %*
