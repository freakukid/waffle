export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    console.log("hello")
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope)
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error)
      })
    })
  } else {
    console.log('Service Worker is not supported in this browser.')
  }
})