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
      backgroundColor: '#2c3e50'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'Este app precisa de acesso à localização para rastrear suas corridas e mostrar sua posição no mapa.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'Este app precisa de acesso à localização para rastrear suas corridas em segundo plano.',
        NSLocationAlwaysUsageDescription: 'Este app precisa de acesso à localização para rastrear suas corridas em segundo plano.',
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
        backgroundColor: '#2c3e50'
      },
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
        'RECORD_AUDIO',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'WAKE_LOCK',
        'VIBRATE'
      ]
    },
    web: {
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Este app precisa de acesso à localização para rastrear suas corridas.',
          locationAlwaysPermission: 'Este app precisa de acesso à localização para rastrear suas corridas em segundo plano.',
          locationWhenInUsePermission: 'Este app precisa de acesso à localização para rastrear suas corridas.'
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
          color: '#2c3e50',
          sounds: ['./assets/sounds/notification.wav']
        }
      ]
    ],
    extra: {
      eas: {
        projectId: '04fdaa5f-cdf6-4dd2-8937-6bea4ac12ed1'
      }
    },
  }
}; 