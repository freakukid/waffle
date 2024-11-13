<template>
  <div>
    <CashierComponent ref="component" :loadingTransaction="loading" :printReceiptAfterTransaction="printReceiptAfterTransaction" @createTransaction="createTransaction" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'store-required', 'language']
})

//Import
const pinia = useStore()
const offlineStore = useOfflineStore()
const { sendNotification, sendFrontendNotification } = useHelpers()
const { calcChange } = useCalculations()
const { $td } = useNuxtApp()
const { handleTransactionRequest } = useHandleRequests()

//Ref
const component = ref(null)

//Data
const printReceiptAfterTransaction = computed(() => pinia.printReceipt)
const loading = ref(false)

//Creates a transaction
async function createTransaction(store, form) {
  //Setup Data
  const { id, tax, inventory } = store
  const { name_column, price_column, quantity_column, discount_column, cost_column } = inventory
  const { payment, cash, card, check, items, total, subtotal, taxTotal, savings } = form
  const transactionItems = Object.values(items).map(item => ({
    name: item[name_column],
    key: item.__key,
    qty: item.__qty,
    price: item[price_column],
    discount: discount_column ? item[discount_column] : 0,
    cost: cost_column ? item[cost_column] : item[price_column],
  }))

  //Exit function if no items in this transaction
  if(transactionItems.length === 0)
    return

  //Make request to create transaction
  loading.value = true
  let response = null
  const postData = { store_id: id, tax: tax, items: transactionItems, quantity_column: quantity_column, payment: payment, cash: cash, card: card, check: check, timestamp: new Date() }
  const isUserOnline = await offlineStore.tryPingingServer()
  if(isUserOnline) {
    response = await handleTransactionRequest(postData)
  } else {
    //Setup fake data to render
    const { getAuthUser } = useAuth()
    const user = getAuthUser()
    const fakeTransaction = {
      date: $td(postData.timestamp, { year: 'numeric', month: 'long', day: 'numeric' }),
      items: transactionItems,
      tax: tax,
      name: user.name,
      payment: payment,
      cash: cash ? parseFloat(cash) : 0,
      card: card,
      check: check,
      total: total,
    }
    offlineStore.addPostRequest('transaction', 'create', postData, { transaction: fakeTransaction })
    sendFrontendNotification(`Your changes have been added to the offline queue and will take effect once you're back online`, 'offline_success')
  }

  //Print Reciept
  if(isUserOnline && printReceiptAfterTransaction.value) {
    const change = payment === 'cash' ? calcChange(cash, total.replace(/,/g, '')) : 0
    await printReceipt(id, transactionItems, tax.toFixed(2), subtotal, taxTotal, savings, total, payment, cash, card, change)
  }

  //Reset transaction, set inventory data, close popup
  loading.value = false
  component.value.$resetTransactionState()
  component.value.openPaymentPopup(false)
  if(response)
    component.value.setInventory(response.inventory)

  //Test data
  // console.log(JSON.stringify(response.transaction))
}

//Prints receipt
async function printReceipt(storeId, items, tax, subtotal, tax_total, savings, total, payment, cash, card, change) {
  //Make Request
  const response = await useFetchApi(`/api/protected/transaction/print`, {
    method: "POST",
    body: {
      store_id: storeId,
      items: items,
      tax: tax,
      subtotal: subtotal,
      tax_total: tax_total,
      savings: savings,
      total: total,
      payment: payment,
      cash: parseFloat(cash).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      card: card,
      change: change.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  })

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }
}
</script>
