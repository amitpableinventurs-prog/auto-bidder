# Fix Android Locations conflict
$env:ANDROID_PREFS_ROOT = $null
# $env:ANDROID_USER_HOME = "C:\Users\Vaibhav Soni\.android" # Keep existing or set a clean one

# Navigate to the android directory
cd android

# Clean and build the release APK
./gradlew clean assembleRelease --stacktrace

# Return to root
cd ..

$apkPath = "android/app/build/outputs/apk/release/app-release.apk"
if (Test-Path $apkPath) {
    Write-Host "Build finished. APK is at: $apkPath" -ForegroundColor Green
} else {
    Write-Host "Build failed. APK not found." -ForegroundColor Red
}
