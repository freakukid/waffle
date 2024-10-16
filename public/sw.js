importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

workbox.routing.registerRoute(
  ({ request }) => 
    (request.destination === 'script' || 
    request.destination === 'style' ||
    request.destination === 'document') &&
    !request.url.endsWith('.scss'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static',
  })
)