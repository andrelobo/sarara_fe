const CACHE_NAME = "barchef-cache-v2"

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/barchef-mark.svg",
  "/barchef.webp",
  "/barchef512.webp",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto")
      return cache.addAll(urlsToCache)
    }),
  )
})

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

self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => caches.match(event.request)),
  )
})

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  try {
    console.log("Sincronizando dados em segundo plano")

    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "SYNC_COMPLETED",
          message: "Sincronizacao em segundo plano concluida",
        })
      })
    })

    return true
  } catch (error) {
    console.error("Erro na sincronizacao em segundo plano:", error)
    return false
  }
}
