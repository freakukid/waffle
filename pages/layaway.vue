<template>
  <div>
    <CashierComponent ref="component" :isLayaway="true" v-model:customer="customer" :loadingTransaction="loading" :customers="filteredCustomers" @addCustomer="addCustomer" @filterCustomer="filterCustomers" @createLayaway="createLayaway" />
  </div>
</template>

<script setup>
//Imports
const { notify } = useNotification()
const pinia = useStore()
const { handleGetRequest } = useHandleRequests()

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
  const { items } = form
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

  //Make request to create transaction
  loading.value = true
  const response = await useFetchApi(`/api/protected/layaway/create`, {
    method: "POST",
    body: {
      store_id: id,
      customer_id: customer.value.id,
      tax: tax,
      items: transactionItems,
      quantity_column: quantity_column,
    }
  }) 
  
  //Display error
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  //show success message
  notify({ title: 'Success', text: response.message, type: 'success'})

  //Reset transaction, set inventory data, close popup
  loading.value = false
  component.value.$resetTransactionState()
  component.value.setInventory(response.inventory)

  //Test data
  // console.log(JSON.stringify(response.layaway))
}
</script>