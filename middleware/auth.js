export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (loggedIn.value) {
    // Prevent redirecting to the login page if already on it
    return navigateTo('/dashboard')
  }
})