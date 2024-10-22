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
      const { handleInventoryRequest } = useHandleRequests()
      const { $eventBus } = useNuxtApp()
      const failedRequests = []
      let inventory = null

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

        } else if(category === 'layaway') {

        }

      }

      //Emit events
      if(inventory) {
        $eventBus.emit('setInventory', inventory)
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