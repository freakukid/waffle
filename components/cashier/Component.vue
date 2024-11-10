<template>
  <div v-if="!loading.startedLoading">
    <div style="height: calc(100vh - 225px); width: calc(100vw - 140px); padding-top: 16px; margin: 0 32px 0 auto;">
      <!-- TOOLBAR -->
      <div class="flex items-center flex-nowrap gap-2 bg-[#090909] py-2 px-6 mb-2 rounded-t-[6px]">
        <el-dropdown placement="bottom-start" trigger="click">
          <span class="p-2 mr-4 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">
            Menu
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="isLayaway" @click="createCustomerRef.openPopup(true)">
                <Icon class="text-green-500 mr-3 mt-[1px]" name="material-symbols:person-add-rounded" /> Create Customer
              </el-dropdown-item>
              
              <div v-if="isBossAccount">
                <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                  <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                    <Icon class="mr-3 mt-[1px]" name="fluent:database-plug-connected-20-filled" /> Link Columns
                  </div>
                </el-tooltip>

                <el-dropdown-item v-else :divided="isLayaway" @click="registerColumnsRef.openPopup()">
                  <Icon class="mr-3 mt-[1px]" name="fluent:database-plug-connected-20-filled" /> Link Columns
                </el-dropdown-item>
              </div>
              
              <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                  <Icon class="mr-3 mt-[1px]" name="tabler:settings-dollar" /> Cashier Settings
                </div>
              </el-tooltip>

              <el-dropdown-item v-else @click="cashierSettingsRef.openPopup()">
                <Icon class="mr-3 mt-[1px]" name="tabler:settings-dollar" /> Cashier Settings
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- SELECT -->
        <div class="w-full flex gap-2">
          <el-select v-if="isLayaway" class="max-w-52" :model-value="customer" value-key="name" filterable remote reserve-keyword clearable placeholder="Search Customer" :remote-method="filterCustomer" @change="$emit('update:customer', $event)">
            <el-option v-for="item in customers" :key="item" :label="item.name" :value="item">
              <div class="relative">
                <div class="absolute -top-1 -left-3">
                  <el-tag size="small" type="success">Customer</el-tag>
                </div>
                <div class="pt-4">{{item.name}}</div>
              </div>
            </el-option>
          </el-select>

          <el-select v-model="form.transaction.query" filterable remote placeholder="Search Product" :remote-method="filterInventory" @change="addItemToTransaction">
            <el-option v-for="(item, key) in options" :key="key" :label="item[store.inventory?.name_column]" :value="key" />
          </el-select>
        </div>
        <!-- SELECT -->
      </div>
      <CashierRegisterColumns v-if="isBossAccount" ref="registerColumnsRef" :storeId="storeId" :inventory="store.inventory ? store.inventory : {}" @setInventory="setInventory" />
      <CashierSettings ref="cashierSettingsRef" :isBoss="isBossAccount" :store="store ? store : {}" @setStore="setStore" />
      <CustomerModifyCustomer ref="createCustomerRef" v-if="isLayaway" :storeId="storeId" @addCustomer="addCustomer" />
      <CashierDisabled ref="disabledCashierRef" />
      <CashierPaymentType ref="paymentTypeRef" @createTransaction="$emit('createTransaction', store, form.transaction)" v-model:payment="form.transaction.payment" v-model:cash="form.transaction.cash" v-model:card="form.transaction.card" v-model:check="form.transaction.check" :loading="loadingTransaction" :total="form.transaction.total.replace(/,/g, '')" />
      <!-- TOOLBAR -->

      <!-- ITEMS -->
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
      <!-- ITEMS -->

      <!-- RESULTS -->
      <div id="footer">
        <div>
          <div v-if="form.transaction.savings !== '0.00'">Savings: {{form.transaction.savings}}</div>
          <div>Subtotal Price: {{form.transaction.subtotal}}</div>
          <div>Tax ({{store.tax}}%): {{form.transaction.taxTotal}}</div>
          <div>Total Price: {{form.transaction.total}}</div>
        </div>

        <el-card v-if="customer" class="text-sm ml-auto" style="width: 250px">
          <div><b>Customer:</b> {{customer.name}}</div>
          <div v-if="customer.company"><b>Company:</b> {{customer.company}}</div>
        </el-card>

        <el-checkbox v-if="!isLayaway" :model-value="printReceiptAfterTransaction" size="large" border @change="pinia.togglePrintReceipt()">Print Receipt After Transaction</el-checkbox>

        <el-button v-if="isLayaway" @click="$emit('createLayaway', store, form.transaction)" :disabled="customer && !Object.keys(form.transaction.items).some(k => Object.prototype.hasOwnProperty.call(form.transaction.items, k))" :loading="loadingTransaction" type="success" style="margin-left: auto;">Create Layaway</el-button>
        <el-button v-else @click="openPaymentPopup(true)" :disabled="!Object.keys(form.transaction.items).some(k => Object.prototype.hasOwnProperty.call(form.transaction.items, k))" type="success" style="margin-left: auto;">Create Transaction</el-button>
      </div>
      <!-- RESULTS -->
    </div>
  </div>
</template>

<script setup>
//Imports
const { $eventBus } = useNuxtApp()
import { ElNotification } from 'element-plus'
const { calcDictSubtotal, calcTaxTotal, calcTotal } = useCalculations()
const { isBoss, getPermissions } = useChecks()
const { handleGetRequest } = useHandleRequests()
const pinia = useStore()
const offlineStore = useOfflineStore()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const store = ref({})
const options = ref([])
const loading = reactive({ startedLoading: true, query: false })

const props = defineProps({
  loadingTransaction: { default: false },
  isLayaway: { default: false },
  customers: { default: [] },
  customer: { default: '' },
  printReceiptAfterTransaction: { default: true }
})

const emits = defineEmits(['filterCustomer', 'addCustomer', 'update:customer', 'createTransaction', 'createLayaway'])

//Form
const form = reactive({
  transaction: {query: '', items: {}, subtotal: '0.00', taxTotal: '0.00', total: '0.00', savings: '0.00', payment: 'cash', card: '', check: '', cash: ''},
})
const initialTransaction = { query: '', items: {}, subtotal: '0.00', taxTotal: '0.00', total: '0.00', savings: '0.00', payment: 'cash', card: '', check: '', cash: '' }
const $resetTransactionState = () => { form.transaction = JSON.parse(JSON.stringify(initialTransaction)) }

//Element Reference
const registerColumnsRef = ref(null)
const disabledCashierRef = ref(null)
const paymentTypeRef = ref(null)
const createCustomerRef = ref(null)
const cashierSettingsRef = ref(null)

//Filters inventory depending on search query
const filterInventory = (query) => {
  loading.query = true
  const { name_column, stock } = store.value.inventory

  if (query) {
    const filteredDictionary = {}

    for (const key in stock) {
      const data = stock[key]
      if (data[name_column].toLowerCase().includes(query.toLowerCase()))
        filteredDictionary[key] = data
    }
    
    options.value = filteredDictionary
  } else {
    options.value = stock
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
    await navigateTo('/inventory')
    return
  }
  loading.startedLoading = false

  await nextTick()
  columnChecks()
})

// Set up the event listener when the component mounts
onMounted(() => {
  $eventBus.on('setInventory', setInventory)
})

// Clean up the event listener when the component is unmounted
onBeforeUnmount(() => {
  $eventBus.off('setInventory', setInventory)
})
//Mount//

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
  store.value = await handleGetRequest(`/api/protected/store/${storeId.value}`)

  //Test data
  //console.log(JSON.stringify(store.value))
}

// TRANSACTION METHODS //
//Adds an item from the transaction
function addItemToTransaction(value) {
  if (value in form.transaction.items) {
    form.transaction.items[value].__qty += 1
    ElNotification({ title: 'Success', message: `Added another ${form.transaction.items[value][store.value.inventory.name_column]} to its quantity.`, type: 'success'})
  } else {
    const item = { ...store.value.inventory.stock[value] }
    item.__qty = 1
    item.__key = value

    form.transaction.items[value] = item
  }

  form.transaction.query = ''

  calcTransactionTotal()
}

//Removes an item from the transaction
function removeItemFromTransaction(key) {
  delete form.transaction.items[key]
  ElNotification({ title: 'Success', message: 'Item removed!', type: 'success'})

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
  form.transaction.cash = total.toFixed(2)
}

//Sets a store value for components to set
function setStore(data) {
  store.value = data
  calcTransactionTotal()
}

//Sets a inventory value for components to set
function setInventory(data) {
  store.value.inventory = data
}

//Toggles Payment Popup
function openPaymentPopup(active) {
  paymentTypeRef.value.openPopup(active)
}

//Layaway Emits
function addCustomer(customer) {
  emits('addCustomer', customer)
}

function filterCustomer(query) {
  emits('filterCustomer', query)
}

function updateCustomer(customer) {
  emits('update:customer', customer)
}

// Expose the methods to parent
defineExpose({
  setInventory,
  openPaymentPopup,
  $resetTransactionState
})
</script>

<style lang="scss" scoped>
#footer {
  display: flex;
  align-items: center;
  gap: 32px;
}

.discount {
  position: relative;
  top: 10px;
  margin-left: 8px;
}
</style>

<style lang="scss">
.el-select-dropdown__item {
  height: max-content;
}
</style>
