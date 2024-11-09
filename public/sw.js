importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

const CACHE_NAME = 'static-v16'

self.addEventListener('install', (event) => {
  // Immediately take control, and skip waiting
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  const cachesToKeep = ['image', 'font', 'api', CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Only delete caches that are not in the cachesToKeep array
          if (!cachesToKeep.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName) // Deletes old caches
          }
        })
      );
    })
  );
});

function matchesApi(apiList, url) {
  return apiList.some(api => {
    if (typeof api === 'string') {
      return api === url.href // Check for string match
    } else if (api instanceof RegExp) {
      return api.test(url.href) // Check for regex match
    }
    return false // Not a match if it's not a string or regex
  })
}

workbox.routing.registerRoute(
  ({ request }) => {
    // Define which types of requests to cache
    const isCachedResource =
      request.destination === 'document' || // HTML documents
      request.destination === 'script' ||   // JS files
      request.destination === 'style' ||    // CSS files
      request.url.endsWith('.json')         // JSON files

    return isCachedResource
  },
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: CACHE_NAME,
    plugins: [
      // Expiration plugin to limit cache size and freshness
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 250,  // Limit the cache to 250 files
        maxAgeSeconds: 30 * 24 * 60 * 60, // Cache files for 30 days
      }),
    ],
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
// workbox.routing.registerRoute(
//   ({ request }) => request.destination === 'manifest',
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'manifest',
//     plugins: [
//       new workbox.expiration.ExpirationPlugin({
//         maxEntries: 1000,
//         maxAgeSeconds: 1 * 24 * 60 * 60, // Cache for 1 Day (in seconds)
//       }),
//     ],
//   }) 
// )

// Cache GET Requests
const getAPIs = [
  //Store
  'https://legitski.com/api/protected/store/stores',
  /^https:\/\/legitski\.com\/api\/protected\/store\/\d+$/,
  //Log
  /^https:\/\/legitski\.com\/api\/protected\/log\/\d+$/,
  //Transaction
  /^https:\/\/legitski\.com\/api\/protected\/transaction\/\d+$/,
  //Layaway
  /^https:\/\/legitski\.com\/api\/protected\/layaway\/\d+$/,
  //Customer
  /^https:\/\/legitski\.com\/api\/protected\/customer\/\d+$/,
  //Workers
  /^https:\/\/legitski\.com\/api\/protected\/workers\/\d+$/,
  //Settings
  'https://legitski.com/api/protected/settings/user-settings',
  //Worker Permissions
  /^https:\/\/legitski\.com\/api\/protected\/workers\/permissions\/\d+$/,
]

workbox.routing.registerRoute(
  ({ url }) => matchesApi(getAPIs, url),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'api',
    plugins: [{
      cacheWillUpdate: async ({ request, response }) => {
        // Check if response is okay, if not return null to not cache it
        if (!response || !response.ok) {
          return null // Return null to indicate not to cache
        }
        return response // Return the valid response to cache it
      },
    }],
  })
)
