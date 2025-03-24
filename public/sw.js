// Nome do cache
const CACHE_NAME = "sarara-cache-v1"

// Arquivos para armazenar em cache
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/pwa-icon-192.png",
  "/pwa-icon-512.png",
  "/assets/sarara-logo.png",
]

// Instalar o service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Ativar o service worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Estratégia de cache: Network First, fallback para cache
self.addEventListener("fetch", (event) => {
  // Ignorar requisições de API
  if (event.request.url.includes("/api/")) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Verificar se a resposta é válida
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clonar a resposta
        const responseToCache = response.clone()

        // Armazenar em cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Se falhar, tentar buscar do cache
        return caches.match(event.request)
      }),
  )
})

// Lidar com mensagens
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Sincronização em segundo plano
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData())
  }
})

// Função para sincronizar dados
async function syncData() {
  try {
    // Aqui você pode implementar a lógica para sincronizar dados
    // Esta função seria chamada quando a conexão for restaurada
    console.log("Sincronizando dados em segundo plano")

    // Exemplo: enviar uma mensagem para o cliente
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "SYNC_COMPLETED",
          message: "Sincronização em segundo plano concluída",
        })
      })
    })

    return true
  } catch (error) {
    console.error("Erro na sincronização em segundo plano:", error)
    return false
  }
}

