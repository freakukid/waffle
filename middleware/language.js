export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useUserSession()

  if (user.value?.language === 'es') {
    const spanishPath = `/es${(to.path).replace('/es', '')}`

    if (to.path !== spanishPath) {
      return navigateTo(spanishPath)
    }
  }
})