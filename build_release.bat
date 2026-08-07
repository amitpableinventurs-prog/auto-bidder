@echo off
set NODE_OPTIONS=--max-old-space-size=8192
set GRADLE_USER_HOME=C:\.g
set ANDROID_USER_HOME=C:\.g\.android
set PATH=C:\Program Files\nodejs;%PATH%

subst P: /D >nul 2>&1
subst P: "C:\Users\Vaibhav Soni\StudioProjects\auto-bidder"

P:
cd auto-bidder\android
call gradlew.bat assembleRelease --no-daemon --max-workers=2 -g C:\.g
