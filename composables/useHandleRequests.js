export default () => {
  const { sendNotification, sendFrontendNotification } = useHelpers()

  const getAPIs = [
    //Store
    '/api/protected/store/stores',
    /^\/api\/protected\/store\/\d+$/,
    //Log
    /^\/api\/protected\/log\/\d+$/,
    //Transaction
    /^\/api\/protected\/transaction\/\d+$/,
    //Layaway
    /^\/api\/protected\/layaway\/\d+$/,
    //Customer
    /^\/api\/protected\/customer\/\d+$/,
    //Workers
    /^\/api\/protected\/workers\/\d+$/,
    //Worker Permissions
    /^\/api\/protected\/workers\/permissions\/\d+$/,
  ]

  function matchesApi(url) {
    return getAPIs.some(api => {
      if (typeof api === 'string') {
        return api === url // Check for string match
      } else if (api instanceof RegExp) {
        return api.test(url) // Check for regex match
      }
      return false // Not a match if it's not a string or regex
    })
  }

  async function handleGetRequest(url) {
    const offlineStore = useOfflineStore()
    const offlineKey = url.replace('/api/protected', '')
    try {
      let response = null

      if(offlineStore.getOnlineStatus()) {
        response = await useFetchApi(url)
        //Save get request
        if(matchesApi(url))
          offlineStore.saveGetRequest(offlineKey, response)
      } else {
        const getRequests = offlineStore.fetchGetRequests()
        if (offlineKey in getRequests) {
          response = getRequests[offlineKey]
        } else {
          sendFrontendNotification(`This page cannot be used offline since the necessary data is not cached, Please connect to the internet for full functionality`, 'error')
        }
      }
      
      return response
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