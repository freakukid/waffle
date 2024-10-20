export default defineNuxtPlugin(() => {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);

      // Check for updates periodically or on certain triggers
      registration.update()

      // Set up an event listener for when the service worker update is found
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing

        newWorker.onstatechange = () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // A new service worker has been installed, inform the user
              console.log('New version available. Please refresh the page.')
              // Optionally, prompt the user to refresh
              // For example, you can show a snackbar message or modal:
              // alert('New version available. Please refresh the page.');
            } else {
              // The service worker is installed for the first time
              console.log('Service Worker is now ready.')
            }
          }
        }
      })

    }).catch(error => {
      console.error('Service Worker registration failed:', error)
    })
  } else {
    console.log('Service Worker is not supported in this browser or not in production environment.')
  }
})