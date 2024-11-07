import { defineStore } from 'pinia'
import { useHandleRequests } from '#imports'

export const useOfflineStore = defineStore('offline', {
  state: () => ({
    isOnline: true,
    requests: [],
    customerRequests: [],
    makingRequests: false
  }),
  actions: {
    async tryPingingServer() {
      try {
        const timestamp = new Date().getTime()
        await useFetchApi(`/api/ping?timestamp=${timestamp}`)
        this.isOnline = true
        
        //If we have pending requests then send them to server while user is online
        if(!this.makingRequests && (this.requests.length || this.customerRequests.length)) {
          this.makingRequests = true
          await this.sendCustomerRequests()

          if(!this.customerRequests.length)
            await this.sendRequests()
          this.makingRequests = false
        }
      } catch(error) {
        this.isOnline = false
        // console.log('?')
      }

      // console.log(JSON.stringify(this.customerRequests))
      // console.log(JSON.stringify(this.requests))

      return this.isOnline
    },
    getOnlineStatus() {
      return this.isOnline
    },
    setOnlineStatus(isOnline) {
      this.isOnline = isOnline
    },
    getRequests() {
      return this.requests
    },
    getCustomerRequests() {
      return this.customerRequests
    },
    addPostRequest(category, type, postData, fakeData) {
      this.requests.push({category: category, type: type, data: postData, ...fakeData})
    },
    addCustomerRequests(postData, fakeData) {
      this.customerRequests.push({data: postData, ...fakeData})
    },
    async sendCustomerRequests() {
      const { handleCustomerRequest } = useHandleRequests()
      const { $eventBus } = useNuxtApp()
      const failedRequests = []
      let anyCustomers = false

      //Loop through and finally make the requests
      for (let i = 0; i < this.customerRequests.length; i++) {
        const { data } = this.customerRequests[i]
        const customerResponse = await handleCustomerRequest(data)

        //If failed request put it back
        if(customerResponse) {
          anyCustomers = true

          //Set customer id to pending layaways
          if('offline_id' in customerResponse) {
            const filteredLayaways = this.requests.filter(layaway => layaway.category === 'layaway' && layaway.layaway?.customer?.offline_id === customerResponse.offline_id)

            filteredLayaways.forEach(layaway => {
              layaway.data.customer_id = customerResponse.customer?.id
            })
          }
        } else {
          failedRequests.push(this.customerRequests[i])
        }
        
      }

      if(anyCustomers) {
        $eventBus.emit('fetchCustomers')
      }

      //Set requests
      this.customerRequests = failedRequests
    },
    async sendRequests() {
      const { handleInventoryRequest, handleTransactionRequest, handleLayawayRequest } = useHandleRequests()
      const { $eventBus } = useNuxtApp()
      const failedRequests = []
      let inventory = null
      let anyTransactions = false
      let anyLayaways = false

      //Loop through and finally make the requests
      for (let i = 0; i < this.requests.length; i++) {
        const { category, type, data } = this.requests[i]

        if(category === 'inventory') {
          const inventoryRequest = await handleInventoryRequest({ path: type, data: data })
          //If failed request put it back
          if(inventoryRequest) {
            inventory = inventoryRequest
          } else {
            failedRequests.push(this.requests[i])
          }
        } else if(category === 'transaction') {
          const transactionRequest = await handleTransactionRequest(data)

          //If failed request put it back
          if(transactionRequest) {
            anyTransactions = true
            inventory = transactionRequest.inventory
          } else {
            failedRequests.push(this.requests[i])
          }
        } else if(category === 'layaway') {
          const layawayRequest = await handleLayawayRequest(data)

          //If failed request put it back
          if(layawayRequest) {
            anyLayaways = true
            inventory = layawayRequest.inventory
          } else {
            failedRequests.push(this.requests[i])
          }
        }
      }

      //Emit events
      if(inventory) {
        $eventBus.emit('setInventory', inventory)
      }

      if(anyTransactions) {
        $eventBus.emit('fetchTransactions')
      }

      if(anyLayaways) {
        $eventBus.emit('fetchLayaways')
      }

      //Set requests
      this.requests = failedRequests
    }
  },
  persist: {
    storage: persistedState.cookiesWithOptions({
      sameSite: 'lax'
    }),
  },
})