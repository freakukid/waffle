importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

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
      request.destination === 'style'       // CSS files

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

//Cache POST Request
const postAPIs = [
  //Inventory
  'https://legitski.com/api/protected/inventory/recieving',
]

workbox.routing.registerRoute(
  ({ request }) => request.method === 'POST' && matchesApi(postAPIs, request.url),
  async (args) => {
    try {
      // Attempt to send the POST request
      const response = await fetch(args.request)

      // If the response is not ok (e.g., the user is offline), save the request
      if (!response.ok) {
        // Construct and save request data for offline use
        await saveFailedPostRequest(args.request)
        return new Response('Network error. Your data will be resent when online.', {
          status: 503 // Service Unavailable
        })
      }

      // If the request is successful, we return nothing (or you can return a placeholder if needed)
      return // Do nothing on successful response
    } catch (error) {
      console.error('Error fetching POST request:', error);
      // Save the request data for offline use
      await saveFailedPostRequest(args.request)
      return new Response('Network error. Your data will be resent when online.', {
        status: 503 // Service Unavailable
      })
    }
  }
)

// Function to save failed POST requests
async function saveFailedPostRequest(request) {
  const requestBody = await request.clone().text(); // Clone and read the body
  const requestData = {
    url: request.url,
    method: request.method,
    body: requestBody,
    headers: Object.fromEntries(request.headers.entries()),
    timestamp: Date.now()  // Add a timestamp as a unique identifier
  }

  // Save request to localStorage
  const failedRequests = JSON.parse(localStorage.getItem('failed_requests')) || []
  failedRequests.push(requestData)
  localStorage.setItem('failed_requests', JSON.stringify(failedRequests))
}

// Function to resend failed requests from localStorage
async function resendFailedRequests() {
  const failedRequests = JSON.parse(localStorage.getItem('failed_requests')) || []

  if (failedRequests.length === 0) return // No failed requests

  for (const reqData of failedRequests) {
    const { url, method, headers, body } = reqData

    try {
      const requestInit = {
        method,
        headers: new Headers(headers),
        body,
      }

      const response = await fetch(url, requestInit)
      
      // Check for success response
      if (response.ok) {
        console.log(`Resent successfully: ${url}`)
        
        // Remove the sent request from localStorage
        const remainingRequests = failedRequests.filter(req =>  req.timestamp !== reqData.timestamp)
        localStorage.setItem('failed_requests', JSON.stringify(remainingRequests))
      }
    } catch (error) {
      console.error(`Failed to resend: ${url}`, error)
      // Keep the request in localStorage for future retries
    }
  }
}

self.addEventListener('online', () => {
  console.log('Back online. Trying to resend failed requests...')
  resendFailedRequests()
})