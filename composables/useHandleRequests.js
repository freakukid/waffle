export default () => {
  const { sendNotification, sendFrontendNotification } = useHelpers()

  async function handleGetRequest(url) {
    try {
      return await useFetchApi(url)
    } catch(error) {
      const { logout } = useAuth()
      const pinia = useStore()
      
      pinia.exitStore()
      logout()
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
        sendNotification(response.statusMessage, 'error')
        return
      }

      // Success case
      if(response.message)
        sendNotification(response.message, 'success')
      else
        sendFrontendNotification(`Operation successful!`, 'success')
      
      // Assuming you want to update the inventory in the store
      if (response.inventory) {
        return response.inventory
      } else {
        sendFrontendNotification(`No inventory data is available`, 'error')
        return false
      }
        
    } catch (error) {
      // Handle any network errors or unexpected issues
      sendFrontendNotification(`An unexpected error occurred, please try again`, 'error')
      console.error('API error:', error) // Log error for debugging
      return false
    }
  }

  async function handleTransactionRequest(postData) {
    const response = await useFetchApi(`/api/protected/transaction/create`, { method: "POST", body: postData })

    //Display error
    if (response.statusCode) {
      sendNotification(response.statusMessage, 'error')
      return false
    }

    //show success message
    sendNotification(response.message, 'success')

    return response
  }

  async function handleLayawayRequest(postData) {
    const response = await useFetchApi(`/api/protected/layaway/create`, { method: "POST", body: postData }) 
    
    //Display error
    if (response.statusCode) {
      sendNotification(response.statusMessage, 'error')
      return false
    }
  
    //show success message
    sendNotification(response.message, 'success')

    return response
  }

  async function handleCustomerRequest(postData) {
    const response = await useFetchApi(`/api/protected/customer/create`, { method: "POST", body: postData })

    //Display error
    if (response.statusCode) {
      sendNotification(response.statusMessage, 'error')
      return false
    }

    //Show success message
    sendNotification(response.message, 'success')

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