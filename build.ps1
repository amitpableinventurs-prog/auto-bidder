$env:ANDROID_PREFS_ROOT = $null
$env:ANDROID_USER_HOME = "C:\android_home"
cd C:\proj\android
./gradlew assembleRelease --stacktrace --no-daemon
