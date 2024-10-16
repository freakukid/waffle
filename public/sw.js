importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

// workbox.routing.registerRoute(
//   /\.(?:css|js|html)$/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'static',
//   })
// );

// workbox.routing.registerRoute(
//   ({ request }) => {
//     const url = new URL(request.url)
//     if(request.destination === 'fetch')
//         console.log(url)
//     const isHtmlCssJs =
//       request.destination === 'document' ||
//       request.destination === 'script' ||
//       request.destination === 'style'

//     return isHtmlCssJs;
//   },
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'static',
//   })
// );


workbox.routing.registerRoute(
  ({ request }) => {
    const url = new URL(request.url);
    
    // Log the current request URL for debugging
    console.log(`Request Destination: ${request.destination}, URL: ${url}`);
    
    // Define which types of requests to cache
    const isCachedResource =
      request.destination === 'document' || // HTML documents
      request.destination === 'script' ||   // JS files
      request.destination === 'style' ||    // CSS files
      (request.destination === '' && (url.pathname.endsWith('.js') ||   // JS fetch requests
                                       url.pathname.endsWith('.css') ||  // CSS fetch requests
                                       url.pathname.endsWith('.html'))); // HTML fetch requests

    return isCachedResource;
  },
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static',
  })
);