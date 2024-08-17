import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => ({
    darkMode: true,
    store: 0,
    filteredColumns: {}
  }),
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode
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
    }
  },
  persist: {
    storage: persistedState.cookiesWithOptions({
      sameSite: 'lax'
    }),
  },
})