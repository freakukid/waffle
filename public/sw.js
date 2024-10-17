importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

workbox.routing.registerRoute(
  ({ request }) => {
    // Log the current request URL for debugging
    // const url = new URL(request.url)
    // console.log(`Request Destination: ${request.destination}, URL: ${url}`)
    
    // Define which types of requests to cache
    const isCachedResource =
      request.destination === 'document' || // HTML documents
      request.destination === 'script' ||   // JS files
      request.destination === 'style'    // CSS files
      // request.destination === 'manifest'    //Manifest

    return isCachedResource
  },
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static',
  })
)

// Cache strategy for images
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'image',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 1 * 24 * 60 * 60, // Cache for 1 Day (in seconds)
      }),
    ],
  })
)

// Cache strategy for font
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'font',
  new workbox.strategies.CacheFirst({
    cacheName: 'font',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 Days
      }),
    ],
  })
)

// Cache all JSON files with Stale While Revalidate
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'manifest' || request.url.endsWith('.json'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'json',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: 1 * 24 * 60 * 60, // Cache for 1 Day (in seconds)
      }),
    ],
  }) 
)

const API_URL = 'https://legitski.com/api/protected/store/stores'
workbox.routing.registerRoute(
  ({ url }) => url.href === API_URL,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'api',
    plugins: [
      {
        cacheWillUpdate: async ({ request, response }) => {
          // Check if response is okay, if not return undefined to not cache it
          if (!response || response.status !== 200) {
            return null
          }
          return response // return the response to cache it
        },
      },
    ],
  })
)