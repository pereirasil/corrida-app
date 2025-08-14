// Service Worker para Corrida App PWA
const CACHE_NAME = 'corrida-app-v1.0.0';
const urlsToCache = [
  '/',
  '/corrida',
  '/amigos',
  '/perfil',
  '/login',
  '/cadastro',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker ativado');
      return self.clients.claim();
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  // Estratégia: Network First para API, Cache First para assets
  if (event.request.url.includes('/api/')) {
    // Para APIs: Network First
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a resposta for válida, cacheia
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se falhar, tenta do cache
          return caches.match(event.request);
        })
    );
  } else if (event.request.url.includes('.tile.openstreetmap.org')) {
    // Para tiles do mapa: Cache First
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          });
        })
    );
  } else {
    // Para outros recursos: Cache First
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Sincronização em background iniciada');
    event.waitUntil(doBackgroundSync());
  }
});

// Função de sincronização em background
async function doBackgroundSync() {
  try {
    // Aqui você pode implementar sincronização de dados offline
    console.log('Sincronizando dados em background...');
    
    // Exemplo: sincronizar dados de corrida salvos offline
    const offlineData = await getOfflineData();
    if (offlineData && offlineData.length > 0) {
      // Enviar dados para o servidor
      console.log('Dados offline sincronizados:', offlineData.length);
    }
  } catch (error) {
    console.error('Erro na sincronização:', error);
  }
}

// Função para obter dados offline (exemplo)
async function getOfflineData() {
  // Implementar lógica para obter dados salvos offline
  return [];
}

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver Detalhes',
          icon: '/icon-192.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icon-192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    // Abrir o app na tela específica
    event.waitUntil(
      clients.openWindow('/corrida')
    );
  } else if (event.action === 'close') {
    // Fechar notificação
    event.notification.close();
  } else {
    // Clique na notificação principal
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mensagens do app principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker carregado para Corrida App');
