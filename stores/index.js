import { defineStore } from 'pinia'
import { useAuth } from '#imports'

export const useStore = defineStore('store', {
  state: () => ({
    darkMode: true,
    store: 0,
    filteredColumns: {},
    printReceipt: true
  }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
    },
    getStore() {
      if(!this.store) {
        const { data, signOut } = useAuth()
        const user = data.value?.user
        //If we are not a boss then get store id from auth data
        if(user.is_boss) {
          navigateTo('/dashboard')
        } else {
          const storeId = user.worker.store_id
          if(!storeId)
            signOut({ callbackUrl: '/login' })
          else {
            this.store = storeId
            return storeId
          }
        }
      } else {
        return this.store
      }
    },
    setStore(id) {
      this.store = id
    },
    exitStore() {
      this.store = 0
    },
    getFilteredColumns() {
      if(this.store in this.filteredColumns)
        return this.filteredColumns[this.store]
      else
        return []
    },
    setFilteredColumns(columns) {
      this.filteredColumns[this.store] = columns
    },
    togglePrintReceipt() {
      this.printReceipt = !this.printReceipt
    },
  },
  persist: {
    storage: persistedState.cookiesWithOptions({
      sameSite: 'lax'
    }),
  },
})