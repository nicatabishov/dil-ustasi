plugins {
    id("com.android.application")
}

android {
    namespace = "com.nicat.dilustasi"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.nicat.dilustasi"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    lint { checkReleaseBuilds = false; abortOnError = false }
}
