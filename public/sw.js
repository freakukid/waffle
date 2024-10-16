importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

workbox.routing.registerRoute(
  ({ request }) => 
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'document' ||
    (request.destination === 'fetch' && 
      (request.url.endsWith('.js') || 
       request.url.endsWith('.css') || 
       request.url.endsWith('.html'))),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static',
  })
)