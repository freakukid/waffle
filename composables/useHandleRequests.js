export default () => {
  const { notify } = useNotification()

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

  async function handleTransactionRequest(postData) {
    const response = await useFetchApi(`/api/protected/transaction/create`, { method: "POST", body: postData })

    //Display error
    if (response.statusCode) {
      notify({ title: 'Error', text: response.statusMessage, type: 'error'})
      return false
    }

    //show success message
    notify({ title: 'Success', text: response.message, type: 'success'})

    return response
  }

  async function handleLayawayRequest(postData) {
    const response = await useFetchApi(`/api/protected/layaway/create`, { method: "POST", body: postData }) 
    
    //Display error
    if (response.statusCode) {
      notify({ title: 'Error', text: response.statusMessage, type: 'error'})
      return false
    }
  
    //show success message
    notify({ title: 'Success', text: response.message, type: 'success'})

    return response
  }

  async function handleCustomerRequest(postData) {
    const response = await useFetchApi(`/api/protected/customer/create`, { method: "POST", body: postData })

    //Display error
    if (response.statusCode) {
      notify({ title: 'Error', text: response.statusMessage, type: 'error'})
      return false
    }

    //Show success message
    notify({ title: 'Success', text: response.message, type: 'success'})

    return response
  }

  return {
    handleInventoryRequest,
    handleTransactionRequest,
    handleLayawayRequest,
    handleCustomerRequest,
    handleGetRequest
  }
}