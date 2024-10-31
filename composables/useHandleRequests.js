import { ElNotification } from 'element-plus'

export default () => {
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
        ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
        return
      }

      // Success case
      ElNotification({ title: 'Success', message: response.message || 'Operation successful!', type: 'success'})
      
      // Assuming you want to update the inventory in the store
      if (response.inventory) {
        return response.inventory
      } else {
        ElNotification({ title: 'Error', message: 'Inventory data is not present.', type: 'error'})
        return false
      }
        
    } catch (error) {
      // Handle any network errors or unexpected issues
      ElNotification({ title: 'Error', message: 'An unexpected error occurred. Please try again.', type: 'error'})
      console.error('API error:', error) // Log error for debugging
      return false
    }
  }

  async function handleTransactionRequest(postData) {
    const response = await useFetchApi(`/api/protected/transaction/create`, { method: "POST", body: postData })

    //Display error
    if (response.statusCode) {
      ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
      return false
    }

    //show success message
    ElNotification({ title: 'Success', message: response.message, type: 'success'})

    return response
  }

  async function handleLayawayRequest(postData) {
    const response = await useFetchApi(`/api/protected/layaway/create`, { method: "POST", body: postData }) 
    
    //Display error
    if (response.statusCode) {
      ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
      return false
    }
  
    //show success message
    ElNotification({ title: 'Success', message: response.message, type: 'success'})

    return response
  }

  async function handleCustomerRequest(postData) {
    const response = await useFetchApi(`/api/protected/customer/create`, { method: "POST", body: postData })

    //Display error
    if (response.statusCode) {
      ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
      return false
    }

    //Show success message
    ElNotification({ title: 'Success', message: response.message, type: 'success'})

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