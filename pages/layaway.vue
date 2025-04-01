<template>
  <div>
    <CashierComponent ref="component" :isLayaway="true" v-model:customer="customer" :loadingTransaction="loading" :customers="filteredCustomers" @addCustomer="addCustomer" @filterCustomer="filterCustomers" @createLayaway="createLayaway" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'store-required', 'language']
})

//Imports
const pinia = useStore()
const offlineStore = useOfflineStore()
const { $eventBus } = useNuxtApp()
const { sendFrontendNotification } = useHelpers()
const { $td } = useNuxtApp()
const { handleGetRequest, handleLayawayRequest } = useHandleRequests()

//Ref
const component = ref(null)

//Data
const loading = ref(false)
const storeId = computed(pinia.getStore)
const customers = ref([])
const customer = ref('')
const customerRequests = computed(offlineStore.getCustomerRequests)
const allCustomers = computed(() => {
  const offlineCustomers = (customerRequests.value || []).map(item => item.customer)
  return [...offlineCustomers, ...customers.value]
})
const filteredCustomers = ref([])

//Filters customers by name and company
const filterCustomers = (query) => {
  if (query) {
    const filtered = []

    for (let i = 0; i < allCustomers.value.length; i++) {
      const customer = allCustomers.value[i]
      const { name, company } = customer
      if (name.toLowerCase().includes(query.toLowerCase()) || company.toLowerCase().includes(query.toLowerCase()))
        filtered.push(customer)
    }
    
    filteredCustomers.value = filtered
  } else {
    filteredCustomers.value = allCustomers.value
  }
}

//Mount
onBeforeMount(async () => {
  await fetchCustomers()
})

// Set up the event listener when the component mounts
onMounted(() => {
  $eventBus.on('fetchCustomers', fetchCustomers)
})

// Clean up the event listener when the component is unmounted
onBeforeUnmount(() => {
  $eventBus.off('fetchCustomers', fetchCustomers)
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
  const { name_column, quantity_column } = inventory
  const { items, total, discount, discountType } = form
  const transactionItems = Object.values(items).map(item => ({
    name: item[name_column],
    key: item.__key,
    qty: item.__qty,
    price: item.__price,
    discount: item.__discount,
    discount_type: item.__discount_type,
    cost: item.__cost,
  }))

  //Exit function if no items in this transaction
  if(transactionItems.length === 0 || !customer.value.name)
    return

  //Make request to create layaway
  loading.value = true
  let response = null
  const postData = { store_id: id, customer_id: customer.value.id, tax: tax, items: transactionItems, quantity_column: quantity_column, status: 'pending', timestamp: new Date(), discount: discount, discount_type: discountType }
  const isUserOnline = await offlineStore.tryPingingServer()

  if(isUserOnline) {
    response = await handleLayawayRequest(postData)
  } else {
    //Setup fake data to render
    const { getAuthUser } = useAuth()
    const user = getAuthUser()
    const fakeLayaway = {
      date: $td(postData.timestamp, { year: 'numeric', month: 'long', day: 'numeric' }),
      name: user.name,
      customer: customer.value,
      items: transactionItems,
      tax: tax,
      total: total,
      status: 'pending',
      discount: discount,
      discount_type: discountType
    }
    offlineStore.addPostRequest('layaway', 'create', postData, { layaway: fakeLayaway })
    sendFrontendNotification(`Your changes have been added to the offline queue and will take effect once you're back online`, 'offline_success')
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