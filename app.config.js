export default {
  expo: {
    name: 'Corrida App',
    slug: 'corrida-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#F26522' // Nova cor laranja principal
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'Este app precisa de acesso à localização para rastrear suas corridas com GPS de alta precisão e mostrar sua posição no mapa.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'Este app precisa de acesso à localização para rastrear suas corridas em segundo plano com precisão máxima.',
        NSLocationAlwaysUsageDescription: 'Este app precisa de acesso à localização para rastrear suas corridas em segundo plano com GPS de alta precisão.',
        NSMicrophoneUsageDescription: 'Este app precisa de acesso ao microfone para comandos de voz durante a corrida.',
        NSAppleMusicUsageDescription: 'Este app precisa de acesso à biblioteca de música para sincronizar playlists.',
        UIBackgroundModes: [
          'location',
          'audio',
          'background-fetch'
        ]
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#F26522' // Nova cor laranja principal
      },
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'RECORD_AUDIO',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'WAKE_LOCK',
        'VIBRATE',
        'FOREGROUND_SERVICE',
        'FOREGROUND_SERVICE_LOCATION'
      ]
    },
    web: {
      favicon: './assets/images/favicon.png',
      themeColor: '#F26522' // Nova cor laranja principal para web
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Este app precisa de acesso à localização para rastrear suas corridas com GPS de alta precisão.',
          locationAlwaysPermission: 'Este app precisa de acesso à localização para rastrear suas corridas em segundo plano com precisão máxima.',
          locationWhenInUsePermission: 'Este app precisa de acesso à localização para rastrear suas corridas com GPS de alta precisão.',
          locationAccuracy: 'BestForNavigation',
          locationUpdateInterval: 500,
          locationUpdateDistance: 2,
          locationUpdateAccuracy: 3,
          // Configurações específicas para alta precisão
          isBackgroundLocationEnabled: true,
          isLocationEnabled: true,
          isNetworkProviderEnabled: true,
          isGpsProviderEnabled: true,
          // Configurações de precisão
          accuracy: 'BestForNavigation',
          timeInterval: 500,
          distanceInterval: 2,
          maxAccuracy: 10,
          minAccuracy: 3,
          // Configurações de filtros
          enableHighAccuracy: true,
          forceRequestLocation: true,
          showLocationIndicator: true,
          // Configurações de segundo plano
          backgroundLocationIndicator: true,
          backgroundLocationIndicatorColor: '#F26522',
          backgroundLocationIndicatorText: 'Rastreando corrida com GPS de alta precisão',
        }
      ],
      [
        'expo-av',
        {
          microphonePermission: 'Este app precisa de acesso ao microfone para comandos de voz durante a corrida.'
        }
      ],
      [
        'expo-notifications',
        {
          icon: './assets/images/notification-icon.png',
          color: '#F26522', // Nova cor laranja principal
          sounds: ['./assets/sounds/notification.wav']
        }
      ]
    ],
    extra: {
      eas: {
        projectId: 'your-project-id-here'
      }
    }
  }
}; 