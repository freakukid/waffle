importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js')

workbox.routing.registerRoute(
  ({ request }) => {
    const url = new URL(request.url);
    const isHtmlCssJs =
      request.destination === 'document' ||
      request.destination === 'script' ||
      request.destination === 'style' ||
      (request.destination === 'fetch' &&
        (url.pathname.match(/\.js$/) || 
         url.pathname.match(/\.css$/) || 
         url.pathname.match(/\.html$/)));

    return isHtmlCssJs;
  },
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static',
  })
);