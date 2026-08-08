$tempDir = "$env:LOCALAPPDATA\Temp\.android"
if (!(Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir -Force }
$env:ANDROID_USER_HOME = $tempDir
$env:GRADLE_USER_HOME = "C:\.g"
$env:HOME = "C:\.g"
$env:USERPROFILE = "C:\.g"

cd android
./gradlew assembleRelease --no-daemon
