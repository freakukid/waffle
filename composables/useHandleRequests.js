export default () => {
  const { notify } = useNotification()

  async function handleInventoryRequest(payload) {
    let { path, data } = payload

    try {
      const response = await useFetchApi(`/api/protected/inventory/${path}`, {
        method: "POST",
        body: {
          ...data
        }
      })

      //Error case
      if (response.statusCode) {
        notify({ title: 'Error', text: response.statusMessage, type: 'error'})
        return
      }

      // Success case
      notify({ title: 'Success', text: response.message || 'Operation successful!', type: 'success'})
      
      // Assuming you want to update the inventory in the store
      if (response.inventory) {
        return response.inventory
      } else {
        notify({ title: 'Error', text: 'Inventory data is not present.', type: 'error'})
        return false
      }
        
    } catch (error) {
      // Handle any network errors or unexpected issues
      notify({ title: 'Error', text: 'An unexpected error occurred. Please try again.', type: 'error'})
      console.error('API error:', error) // Log error for debugging
      return false
    }
  }

  async function handleGetRequest(url) {
    try {
      return await useFetchApi(url)
    } catch(error) {
      const { signOut } = useAuth()
      const pinia = useStore()
      
      pinia.exitStore()
      signOut({ callbackUrl: '/login' })
    }
  }

  return {
    handleInventoryRequest,
    handleGetRequest
  }
}