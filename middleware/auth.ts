export default defineNuxtRouteMiddleware((to, from) => {
    const { loggedIn } = useUserSession()

    if (loggedIn.value) {
      // Prevent redirecting to the login page if already on it
      return navigateTo('/dashboard')
    }

    // you may need to add some extra login to this
    
})