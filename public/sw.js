importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

// workbox.routing.registerRoute(
//   /\.(?:css|js|html)$/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'static',
//   })
// );

workbox.routing.registerRoute(
  ({ request }) => {
    const url = new URL(request.url)
    if(request.destination === 'fetch')
        console.log(url)
    const isHtmlCssJs =
      request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      request.destination === 'fetch'

    return isHtmlCssJs;
  },
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static',
  })
);