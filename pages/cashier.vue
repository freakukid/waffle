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
  const { name_column, quantity_column } = inventory
  const { cash, card, cardType, check, checkNumber, items, total, subtotal, taxTotal, savings, change, discount, discountType } = form
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
  if(transactionItems.length === 0)
    return

  //Make request to create transaction
  loading.value = true
  let response = null
  const postData = { store_id: id, tax: tax, items: transactionItems, quantity_column: quantity_column, cash: cash, card: card, card_type: cardType, check: check, check_number: checkNumber, discount: discount, discount_type: discountType, timestamp: new Date() }
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
      cash: cash ? parseFloat(cash) : 0,
      card: card ? parseFloat(card) : 0,
      card_type: cardType,
      check: check ? parseFloat(check) : 0,
      check_number: checkNumber,
      total: total,
      discount: discount,
      discount_type: discountType
    }
    offlineStore.addPostRequest('transaction', 'create', postData, { transaction: fakeTransaction })
    sendFrontendNotification(`Your changes have been added to the offline queue and will take effect once you're back online`, 'offline_success')
  }

  //Print Reciept
  if(isUserOnline && printReceiptAfterTransaction.value) {
    //TODO
    await printReceipt(id, transactionItems, tax.toFixed(2), subtotal, taxTotal, savings, total, cash, card, check, cardType, change, discount, discountType)
  }

  //Reset transaction, set inventory data, close popup
  loading.value = false
  component.value.$resetTransactionState()
  component.value.togglePaymentPopup(false)
  if(response)
    component.value.setInventory(response.inventory)

  //Test data
  // console.log(JSON.stringify(response.transaction))
}

//Prints receipt
async function printReceipt(storeId, items, tax, subtotal, tax_total, savings, total, cash, card, check, cardType, change, discount, discountType) {
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
      cash: parseFloat(cash),
      card: parseFloat(card),
      check: parseFloat(check),
      card_type: cardType,
      change: change,
      discount: discount,
      discount_type: discountType
    }
  })

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }
}
</script>
