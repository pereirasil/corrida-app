export default {
  expo: {
    name: "Corrida App",
    slug: "corrida-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#F26522"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.corridaapp.ios",
      buildNumber: "1.0.0",
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Este app precisa de acesso à localização para rastrear suas corridas com alta precisão GPS.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Este app precisa de acesso à localização em segundo plano para continuar rastreando durante a corrida.",
        NSLocationAlwaysUsageDescription: "Este app precisa de acesso à localização em segundo plano para continuar rastreando durante a corrida.",
        UIBackgroundModes: ["location", "background-processing"],
        NSLocationAccuracyBestForNavigation: true,
        NSLocationAccuracyReduced: false,
        NSLocationAccuracyBest: true,
        NSLocationUpdateInterval: 1,
        NSLocationUpdateDistance: 5,
        NSLocationUpdateAccuracy: 10
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#F26522"
      },
      package: "com.corridaapp.android",
      versionCode: 1,
      permissions: [
        "ACCESS_LOCATION_EXTRA_COMMANDS",
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "FOREGROUND_SERVICE",
        "FOREGROUND_SERVICE_LOCATION",
        "SYSTEM_ALERT_WINDOW",
        "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
        "RECEIVE_BOOT_COMPLETED",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "ACCESS_WIFI_STATE",
        "CHANGE_WIFI_STATE",
        "BLUETOOTH",
        "BLUETOOTH_ADMIN",
        "BLUETOOTH_CONNECT",
        "BLUETOOTH_SCAN"
      ],
      usesCleartextTraffic: true,
      allowBackup: true,
      foregroundServiceType: ["location"],
      locationAccuracy: "high",
      locationUpdateInterval: 1000,
      locationUpdateDistance: 5,
      locationUpdateAccuracy: 10
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "webpack",
      output: "export",
      build: {
        babel: {
          include: ["@expo/vector-icons"]
        }
      },
      pwa: {
        name: "Corrida App",
        shortName: "Corrida",
        description: "App de corrida com GPS inteligente e detecção de ciclovias",
        startUrl: "/",
        display: "standalone",
        backgroundColor: "#F26522",
        themeColor: "#F26522",
        orientation: "portrait",
        scope: "/",
        lang: "pt-BR",
        categories: ["sports", "health", "fitness"],
        icons: [
          {
            src: "./assets/icon.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "./assets/icon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        screenshots: [
          {
            src: "./assets/splash.png",
            sizes: "1280x720",
            type: "image/png",
            formFactor: "wide"
          }
        ]
      }
    },
    plugins: [
      [
        "expo-location",
        {
          locationAccuracy: "high",
          locationUpdateInterval: 1000,
          locationUpdateDistance: 5,
          isBackgroundLocationEnabled: true,
          isLocationEnabled: true,
          isNetworkProviderEnabled: true,
          isGpsProviderEnabled: true,
          accuracy: "high",
          timeInterval: 1000,
          distanceInterval: 5,
          maxAccuracy: 20,
          minAccuracy: 5,
          enableHighAccuracy: true,
          forceRequestLocation: false,
          showLocationIndicator: true,
          backgroundLocationIndicator: true,
          backgroundLocationIndicatorColor: "#F26522",
          backgroundLocationIndicatorText: "Corrida App está rastreando sua localização"
        }
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#F26522",
          sounds: ["./assets/notification-sound.wav"]
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "your-project-id-here"
      }
    }
  }
}; 