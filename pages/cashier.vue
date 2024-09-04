<template>
  <div>
    <div v-if="!loading.startedLoading">
      <div style="height: calc(100vh - 215px);width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <el-select
          v-model="form.transaction.query"
          filterable
          remote
          reserve-keyword
          placeholder="Please enter a keyword"
          :remote-method="filterInventory"
          @change="addItemToTransaction"
        >
          <el-option v-for="(item, key) in options" :key="key" :label="item[store.inventory?.name_column]" :value="key" />
        </el-select>

        <div id="toolbar">
          <CashierRegisterColumns v-if="isBossAccount" ref="registerColumnsRef" :storeId="storeId" :inventory="store.inventory ? store.inventory : {}" @setInventory="setInventory" />
          <CashierSettings :isBoss="isBossAccount" :store="store ? store : {}" @setStore="setStore" />
          <CashierDisabled ref="disabledCashierRef" />
        </div>

        <el-table :data="Object.keys(form.transaction.items).map(key => form.transaction.items[key])" style="width: 100%; height: 100%;" table-layout="auto" >
          <el-table-column label="Quantity">
            <template #default="scope">
              <el-input-number v-model="scope.row.__qty" :min="1" @change="calcTransactionTotal()" />
            </template>
          </el-table-column>
          <el-table-column #default="scope" label="Price">
            <span v-if="store.inventory?.discount_column && scope.row[store.inventory?.discount_column] > 0">
              <div>
                <span style="text-decoration: line-through;">{{scope.row[store.inventory?.price_column]}}</span>
                <el-tag class="discount" size="small" type="success">{{scope.row[store.inventory?.discount_column]}}%</el-tag>
              </div>
              <div v-if="scope.row.__new_price">{{scope.row.__new_price}}</div>
            </span>

            <div v-else>{{scope.row[store.inventory?.price_column]}}</div>
            
          </el-table-column>
          <el-table-column :prop="store.inventory?.name_column" label="Name" />
          <el-table-column label="Operations">
            <template #default="scope">
              <el-button size="small" type="danger" @click="removeItemFromTransaction(scope.row.__key)">
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div id="footer">
          <div>
            <div v-if="form.transaction.savings !== '0.00'">Savings: {{form.transaction.savings}}</div>
            <div>Subtotal Price: {{form.transaction.subtotal}}</div>
            <div>Tax ({{store.tax}}%): {{form.transaction.taxTotal}}</div>
            <div>Total Price: {{form.transaction.total}}</div>
          </div>
          <el-checkbox v-model="printReceiptAfterTransaction" size="large" border @change="pinia.togglePrintReceipt()">Print Receipt After Transaction</el-checkbox>

          <el-button @click="createTransaction()" type="success" :disabled="!Object.keys(form.transaction.items).some(k => Object.prototype.hasOwnProperty.call(form.transaction.items, k))" :loading="loading.createTransaction" style="margin-left: auto;">Create Transaction</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
//Imports
const { notify } = useNotification()
const pinia = useStore()
const { calcDictSubtotal, calcTaxTotal, calcTotal } = useCalculations()
const { isBoss, getPermissions } = useChecks()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const printReceiptAfterTransaction = computed(() => pinia.printReceipt)
const store = ref({})
const options = ref([])
const loading = reactive({ startedLoading: true, query: false, createTransaction: false })

//Form
const form = reactive({
  transaction: {query: '', items: {}, subtotal: '0.00', taxTotal: '0.00', total: '0.00', savings: '0.00'}
})
const initialTransaction = { query: '', items: {}, subtotal: '0.00', taxTotal: '0.00', total: '0.00', savings: '0.00' }
const $resetTransactionState = () => {
  form.transaction = JSON.parse(JSON.stringify(initialTransaction))
}

//Element Reference
const registerColumnsRef = ref(null)
const disabledCashierRef = ref(null)

//Filters inventory depending on search query
const filterInventory = (query) => {
  loading.query = true
  const name = store.value.inventory.name_column

  if (query) {
    options.value = store.value.inventory.stock.filter((data) => {
      return data[name].toLowerCase().trim().includes(query.toLowerCase().trim())
    })
  } else {
    options.value = store.value.inventory.stock
  }
  loading.query = false
}

//Mount//
onBeforeMount(async () => {
  //If no store id is present return to dashboard
  //If columns are not set and we are a worker return to dashboard
  if(!storeId.value) {
    await navigateTo('/dashboard')
    return
  }

  //If you are not permitted to be here then return to dashboard
  if(!isBossAccount.value) {
    const permissions = await getPermissions()

    if(!permissions.make_transactions) {
      window.location.href = '/dashboard'
      return
    }
  }
  
  await getStore()

  if(store.value.inventory?.columns.length < 2) {
    await navigateTo('/boss/inventory')
    return
  }
  loading.startedLoading = false

  await nextTick()
  columnChecks()
})
//Mount//

//Sets a inventory value for components to set
function setInventory(data) {
  store.value.inventory = data
}

//Sets a store value for components to set
function setStore(data) {
  store.value = data
  calcTransactionTotal()
}

//Checks if we have name and price columns set, if not prompt user
function columnChecks() {
  if(store.value.inventory && (!store.value.inventory.name_column || !store.value.inventory.price_column)) {
    if(isBossAccount.value) {
      registerColumnsRef.value.openPopup()
    } else {
      disabledCashierRef.value.openPopup()
    }
  }
}

//Gets the user store
async function getStore() {
  store.value = await useFetchApi(`/api/protected/store/${storeId.value}`)
  // console.log(JSON.stringify(store.value))
}

// TRANSACTION METHODS //
//Adds an item from the transaction
function addItemToTransaction(value) {
  if (value in form.transaction.items) {
    form.transaction.items[value].__qty += 1
    notify({ title: 'Success', text: `Added another ${form.transaction.items[value][store.value.inventory.name_column]} to its quantity.`, type: 'success'})
  } else {
    const item = { ...store.value.inventory.stock[value] }
    item.__qty = 1
    item.__key = value

    form.transaction.items[value] = item
  }

  calcTransactionTotal()
}

//Removes an item from the transaction
function removeItemFromTransaction(key) {
  delete form.transaction.items[key]
  notify({ title: 'Success', text: 'Item removed!', type: 'success'})

  calcTransactionTotal()
}

//Transaction calculations
function calcTransactionTotal() {
  //Add subtotal from accumulative items
  const { subtotal, noDiscountSubtotal, savings } = calcDictSubtotal(form.transaction.items, '__qty', store.value.inventory.price_column, store.value.inventory.discount_column, store.value.inventory.cost_column)
  form.transaction.subtotal = subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  form.transaction.no_discount_subtotal = noDiscountSubtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  form.transaction.savings = savings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  //Calculate Tax Total
  const taxTotal = calcTaxTotal(subtotal, store.value.tax)
  form.transaction.taxTotal = taxTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  //Calculate Total
  const total = calcTotal(subtotal, taxTotal)
  form.transaction.total = total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

//Creates a transaction
async function createTransaction() {
  //Setup Data
  const { name_column, price_column, quantity_column, discount_column, cost_column } = store.value.inventory
  const transactionItems = Object.values(form.transaction.items).map(item => ({
    name: item[name_column],
    key: item.__key,
    qty: item.__qty,
    price: item[price_column],
    discount: discount_column ? item[discount_column] : 0,
    cost: cost_column ? item[cost_column] : item[price_column]
  }))

  //Exit function if no items in this transaction
  if(transactionItems.length === 0) {
    return
  }

  //Make request to create transaction
  loading.createTransaction = true
  const response = await useFetchApi(`/api/protected/transaction/create`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      tax: store.value.tax,
      items: transactionItems,
      quantity_column: quantity_column
    }
  })
  loading.createTransaction = false
  
  //Display error
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  //show success message
  notify({ title: 'Success', text: response.message, type: 'success'})

  //Print Reciept
  if(printReceiptAfterTransaction.value) {
    const {subtotal, total, taxTotal, savings} = form.transaction
    await printReceipt(transactionItems, store.value.tax.toFixed(2), subtotal, taxTotal, savings, total)
  }

  //Reset transaction, set inventory data
  $resetTransactionState()
  store.value.inventory = response.inventory
}

//Prints receipt
async function printReceipt(items, tax, subtotal, tax_total, savings, total) {
  //Make Request
  const response = await useFetchApi(`/api/protected/transaction/print`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      items: items,
      tax: tax,
      subtotal: subtotal,
      tax_total: tax_total,
      savings: savings,
      total: total
    }
  })

  //Display error
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }
}
</script>

<style lang="scss" scoped>
#footer {
  display: flex;
  align-items: center;
  gap: 32px;
}

#toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.discount {
  position: relative;
  top: 10px;
  margin-left: 8px;
}
</style>