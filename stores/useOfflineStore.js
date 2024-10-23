import { defineStore } from 'pinia'
import { useHandleRequests } from '#imports'

export const useOfflineStore = defineStore('offline', {
  state: () => ({
    isOnline: true,
    requests: [],
  }),
  actions: {
    async tryPingingServer() {
      try {
        await useFetchApi('/api/ping')
        this.isOnline = true
        
        //If we have pending requests then send them to server while user is online
        if(this.requests.length) {
          await this.sendRequests()
        }
      } catch(error) {
        this.isOnline = false
      }

      console.log(JSON.stringify(this.requests))

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
    addPostRequest(category, type, postData, fakeData) {
      this.requests.push({category: category, type: type, data: postData, ...fakeData})
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