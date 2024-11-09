export default defineNuxtRouteMiddleware((to, from) => {
  const pinia = useStore()
  const storeId = pinia.getStore()

  if (!storeId) {
    // Prevent going to a page that needs a store
    return navigateTo('/dashboard')
  }
})