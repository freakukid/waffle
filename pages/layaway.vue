<template>
  <div>
    <CashierComponent ref="component" :isLayaway="true" v-model:customer="customer" :loadingTransaction="loading" :customers="filteredCustomers" @addCustomer="addCustomer" @filterCustomer="filterCustomers" @createLayaway="createLayaway" />
  </div>
</template>

<script setup>
//Imports
const pinia = useStore()
const offlineStore = useOfflineStore()
const { notify } = useNotification()
const { formatDate } = useFormatter()
const { handleGetRequest, handleLayawayRequest } = useHandleRequests()

//Ref
const component = ref(null)

//Data
const loading = ref(false)
const storeId = computed(pinia.getStore)
const filteredCustomers = ref([])
const customers = ref([])
const customer = ref('')

//Filters customers by name and company
const filterCustomers = (query) => {
  if (query) {
    const filtered = []

    for (let i = 0; i < customers.value.length; i++) {
      const customer = customers.value[i]
      const { name, company } = customer
      if (name.toLowerCase().includes(query.toLowerCase()) || company.toLowerCase().includes(query.toLowerCase()))
        filtered.push(customer)
    }
    
    filteredCustomers.value = filtered
  } else {
    filteredCustomers.value = customers.value
  }
}

//Mount
onBeforeMount(async () => {
  await fetchCustomers()
})
//Mount

//Fetch customers
async function fetchCustomers() {
  customers.value = await handleGetRequest(`/api/protected/customer/${storeId.value}`)
}

//Adds customers to the list
function addCustomer(customer) {
  customers.value.push(customer)
}

//Creates layaway
async function createLayaway(store, form) {
  //Setup Data
  const { id, tax, inventory } = store
  const { name_column, price_column, quantity_column, discount_column, cost_column } = inventory
  const { items, total } = form
  const transactionItems = Object.values(items).map(item => ({
    name: item[name_column],
    key: item.__key,
    qty: item.__qty,
    price: item[price_column],
    discount: discount_column ? item[discount_column] : 0,
    cost: cost_column ? item[cost_column] : item[price_column],
  }))

  //Exit function if no items in this transaction
  if(transactionItems.length === 0 || !customer.value.id)
    return

  //Make request to create layaway
  loading.value = true
  let response = null
  const postData = { store_id: id, customer_id: customer.value.id, tax: tax, items: transactionItems, quantity_column: quantity_column, status: 'pending', timestamp: new Date() }
  const isUserOnline = await offlineStore.tryPingingServer()

  if(isUserOnline) {
    response = await handleLayawayRequest(postData)
  } else {
    //Setup fake data to render
    const { data } = useAuth()
    const fakeLayaway = {
      date: formatDate(postData.timestamp),
      name: data.value.user.name,
      customer: customer.value,
      items: transactionItems,
      tax: tax,
      total: total,
      status: 'pending',
    }
    offlineStore.addPostRequest('layaway', 'create', postData, { layaway: fakeLayaway })
    notify({ title: 'Offline Success', text: `Added to the offline queue. Changes will take effect when you're back online.`, type: 'success'})
  }

  //Reset transaction, set inventory data, close popup
  loading.value = false
  component.value.$resetTransactionState()
  if(response)
    component.value.setInventory(response.inventory)

  //Test data
  // console.log(JSON.stringify(response.layaway))
}
</script>