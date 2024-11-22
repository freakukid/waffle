import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => ({
    store: 0,
    darkMode: true,
    printReceipt: true,
    staticFilter: {
      transaction: ['id', 'date', 'cashier', 'product'],
      layaway: ['id', 'date', 'cashier', 'customer', 'product', 'status'],
      customer: ['id', 'customer', 'company', 'email', 'phone']
    },
    filteredColumns: {},
  }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
    },
    getStore() {
      if(!this.store) {
        const { getAuthUser, logout } = useAuth()
        const user = getAuthUser()
        //If we are not a boss then get store id from auth data
        if(user && !user.is_boss) {
          const storeId = user.worker.store_id
          if(!storeId)
            logout()
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
    getStaticFilters(key) {
      return this.staticFilter[key]
    },
    setStaticFilters(key, filters) {
      this.staticFilter[key] = filters
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