<template>
  <div v-if="!loading.startedLoading">
    <div style="height: calc(100vh - 225px); width: calc(100% - 70px); padding-top: 16px; margin: 0 32px 0 auto">
      <!-- TOOLBAR -->
      <div class="flex items-center flex-nowrap gap-2 bg-[#090909] py-2 px-6 mb-2 rounded-t-[6px]">
        <el-dropdown placement="bottom-start" trigger="click">
          <span class="p-2 mr-4 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">
            {{ $t(`label.menu`) }}
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="isLayaway" @click="createCustomerRef.openPopup(true)">
                <Icon class="text-green-500 mr-3 mt-[1px]" name="material-symbols:person-add-rounded" /> {{ $t(`title.Create Customer`) }}
              </el-dropdown-item>

              <div v-if="isBossAccount">
                <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                  <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                    <Icon class="mr-3 mt-[1px]" name="fluent:database-plug-connected-20-filled" /> {{ $t(`title.Link Columns`) }}
                  </div>
                </el-tooltip>

                <NuxtLink v-else to="/settings#columns">
                  <el-dropdown-item :divided="isLayaway"> <Icon class="mr-3 mt-[1px]" name="fluent:database-plug-connected-20-filled" /> {{ $t(`title.Link Columns`) }} </el-dropdown-item>
                </NuxtLink>
              </div>

              <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50"><Icon class="mr-3 mt-[1px]" name="tabler:settings-dollar" /> {{ $t(`title.Cashier Settings`) }}</div>
              </el-tooltip>

              <NuxtLink v-else to="/settings#receipt">
                <el-dropdown-item> <Icon class="mr-3 mt-[1px]" name="tabler:settings-dollar" /> {{ $t(`title.Cashier Settings`) }} </el-dropdown-item>
              </NuxtLink>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- SELECT -->
        <div class="w-full flex gap-2">
          <el-select
            v-if="isLayaway"
            class="max-w-52"
            :model-value="customer"
            value-key="name"
            filterable
            remote
            reserve-keyword
            clearable
            :placeholder="$t('label.Search Customer')"
            :remote-method="filterCustomer"
            @change="$emit('update:customer', $event)"
          >
            <el-option v-for="item in customers" :key="item" :label="item.name" :value="item">
              <div class="relative">
                <div>{{ item.name }}</div>
              </div>
            </el-option>
          </el-select>

          <el-select v-model="form.transaction.query" filterable remote :placeholder="$t('label.Search Product')" :remote-method="filterInventory" @change="addItemToTransaction">
            <el-option v-for="(item, key) in options" :key="key" :label="item[store.inventory?.name_column]" :value="key" />
          </el-select>
        </div>
        <!-- SELECT -->
      </div>
      <CustomerModifyCustomer ref="createCustomerRef" v-if="isLayaway" :storeId="storeId" @addCustomer="addCustomer" />
      <CashierDisabled ref="disabledCashierRef" :isBoss="isBossAccount" />
      <CashierPayment ref="paymentRef" :loading="loadingTransaction" :total="form.transaction.total.replace(/,/g, '')" @createTransaction="createTransaction" />
      <CashierItemDiscount ref="itemDiscountRef" @update="updateItem" />
      <CashierTransactionDiscount ref="transactionDiscountRef" @update="addDiscount" />
      <!-- TOOLBAR -->

      <!-- ITEMS -->
      <el-table :data="Object.keys(form.transaction.items).map((key) => form.transaction.items[key])" style="width: 100%; height: 100%" table-layout="auto" :empty-text="$t('label.No Product')">
        <el-table-column :label="$t('label.Quantity')">
          <template #default="scope">
            <el-input-number v-model="scope.row.__qty" :min="1" @change="calcTransactionTotal()" />
          </template>
        </el-table-column>
        <el-table-column #default="scope" :label="$t('label.Price')">
          <span v-if="scope.row.__discount > 0">
            <div>
              <span style="text-decoration: line-through">{{ scope.row[store.inventory?.price_column] }}</span>
              <el-tag class="discount" size="small" type="success">
                <span v-if="scope.row.__discount_type === 'percent'">{{ scope.row.__discount }}%</span>
                <span v-else-if="scope.row.__discount_type === 'amount'">-${{ scope.row.__discount }}</span>
              </el-tag>
            </div>
            <div v-if="scope.row.__new_price">{{ scope.row.__new_price }}</div>
          </span>

          <div v-else>{{ scope.row[store.inventory?.price_column] }}</div>
        </el-table-column>
        <el-table-column :prop="store.inventory?.name_column" :label="$t('label.name')" />
        <el-table-column :label="$t('label.operations')">
          <template #default="scope">
            <div class="flex gap-2 flex-wrap">
              <el-button size="small" :type="scope.row.__discount > 0 ? 'warning' : 'success'" @click="openItemDiscount(scope.row.__key)">
                <span v-if="scope.row.__discount > 0">{{ $t('label.Edit Discount') }}</span>
                <span v-else>{{ $t('label.Add Discount') }}</span>
              </el-button>
              <el-button class="!ml-0" size="small" type="danger" @click="removeItemFromTransaction(scope.row.__key)">
                {{ $t('label.delete') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!-- ITEMS -->

      <!-- RESULTS -->
      <div id="footer">
        <div>
          <div v-if="parseFloat(form.transaction.discount) > 0">{{ $t('label.Transaction Discount') }}: <span v-if="form.transaction.discountType === 'percent'">{{ form.transaction.discount }}%</span><span v-else>{{parseFloat(form.transaction.discount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}}</span></div>
          <div v-if="form.transaction.savings !== '0.00'">{{ $t('label.Savings') }}: {{ form.transaction.savings }}</div>
          <div>{{ $t('label.Subtotal Price') }}: {{ form.transaction.subtotal }}</div>
          <div>{{ $t('label.Tax') }} ({{ store.tax }}%): {{ form.transaction.taxTotal }}</div>
          <div>{{ $t('label.Total Price') }}: {{ form.transaction.total }}</div>
        </div>

        <el-card v-if="customer" class="text-sm ml-5 my-4" style="width: 250px">
          <div>
            <b>{{ $t('label.Customer') }}:</b> {{ customer.name }}
          </div>
          <div v-if="customer.company">
            <b>{{ $t('label.Company') }}:</b> {{ customer.company }}
          </div>
        </el-card>

        <div class="flex items-center gap-2 flex-wrap">
          <el-checkbox v-if="!isLayaway" :model-value="printReceiptAfterTransaction" size="large" border @change="pinia.togglePrintReceipt()">{{ $t('label.Print Receipt After Transaction') }}</el-checkbox>

          <el-button
            @click="transactionDiscountRef.openPopup(form.transaction.no_transaction_discount_subtotal, form.transaction.discount, form.transaction.discountType)"
            :disabled="parseFloat(form.transaction.subtotal) === 0"
            type="primary"
          >
            <span v-if="parseFloat(form.transaction.discount) === 0">{{ $t('label.Add Discount') }}</span>
            <span v-else>{{ $t('label.Edit Discount') }}</span>
          </el-button>
        </div>

        <el-button v-if="isLayaway" @click="$emit('createLayaway', store, form.transaction)" class="ml-auto" :disabled="customer && !Object.keys(form.transaction.items).some((k) => Object.prototype.hasOwnProperty.call(form.transaction.items, k))" :loading="loadingTransaction" type="success">
          {{ $t('label.Create Layaway') }}
        </el-button>
        <el-button v-else @click="togglePaymentPopup(true)" class="ml-auto" :disabled="!Object.keys(form.transaction.items).some((k) => Object.prototype.hasOwnProperty.call(form.transaction.items, k))" type="success">
          {{ $t('label.Create Transaction') }}
        </el-button>
      </div>
      <!-- RESULTS -->
    </div>
  </div>
</template>

<script setup>
//Imports
import { Decimal } from 'decimal.js'
const { $eventBus } = useNuxtApp()
const { sendFrontendNotification } = useHelpers()
const { calcTaxTotal, calcTotal, calcDiscount, calcChange } = useCalculations()
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
  transaction: { query: '', items: {}, subtotal: '0.00', taxTotal: '0.00', total: '0.00', savings: '0.00', change: '0.00', card: '0.00', check: '0.00', cash: '0.00', cardType: '', checkNumber: '', discount: 0, discountType: 'percent' }
})
const initialTransaction = { query: '', items: {}, subtotal: '0.00', taxTotal: '0.00', total: '0.00', savings: '0.00', change: '0.00', card: '0.00', check: '0.00', cash: '0.00', cardType: '', checkNumber: '', discount: 0, discountType: 'percent'}
const $resetTransactionState = () => {
  form.transaction = JSON.parse(JSON.stringify(initialTransaction))
}

//Element Reference
const disabledCashierRef = ref(null)
const paymentRef = ref(null)
const createCustomerRef = ref(null)
const itemDiscountRef = ref(null)
const transactionDiscountRef = ref(null)

//Filters inventory depending on search query
const filterInventory = (query) => {
  loading.query = true
  const { name_column, stock } = store.value.inventory

  if (query) {
    const filteredDictionary = {}

    for (const key in stock) {
      const data = stock[key]
      if (data[name_column].toLowerCase().includes(query.toLowerCase())) filteredDictionary[key] = data
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
  if (!storeId.value) {
    await navigateTo('/dashboard')
    return
  }

  //If you are not permitted to be here then return to dashboard
  if (!isBossAccount.value) {
    const permissions = await getPermissions()

    if (!permissions.make_transactions) {
      window.location.href = '/dashboard'
      return
    }
  }

  await getStore()

  if (store.value.inventory?.columns.length < 2) {
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
  if (store.value.inventory && (!store.value.inventory.name_column || !store.value.inventory.price_column)) {
    disabledCashierRef.value.openPopup()
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
    sendFrontendNotification('Increased the quantity', 'success', { name: form.transaction.items[value][store.value.inventory.name_column] })
  } else {
    const item = { ...store.value.inventory.stock[value] }
    item.__qty = 1
    item.__key = value
    item.__discount = store.value.inventory.discount_column ? item[store.value.inventory.discount_column] : 0
    item.__discount_type = 'percent'
    item.__price = item[store.value.inventory.price_column]
    item.__cost = store.value.inventory.cost_column ? item[store.value.inventory.cost_column] : item[store.value.inventory.price_column]
    if(item.__discount > 0)
      item.__new_price = calcDiscount(item.__price, item.__discount, item.__discount_type)

    form.transaction.items[value] = item
  }

  form.transaction.query = ''

  calcTransactionTotal()
}

//Removes an item from the transaction
function removeItemFromTransaction(key) {
  delete form.transaction.items[key]
  sendFrontendNotification('Item removed!', 'success')
  calcTransactionTotal()
}

//Update item right now only discount
function updateItem(item, notificationMsg) {
  form.transaction.items[item.__key] = item
  sendFrontendNotification(notificationMsg, 'success')
  calcTransactionTotal()
}

//Add discount to the entire transaction
function addDiscount(discount, discountType) {
  form.transaction.discount = discount
  form.transaction.discountType = discountType
  sendFrontendNotification('Discount Added!', 'success')
  calcTransactionTotal()
}

//Open discount popup
function openItemDiscount(key) {
  itemDiscountRef.value.openPopup(true, form.transaction.items[key])
}

//Transaction calculations
function calcTransactionTotal() {
  const {cash, card, check} = form.transaction
  //Add subtotal from accumulative items
  let subtotal = new Decimal(0)
  let subtotalWithoutDiscount = new Decimal(0)
  let subtotalWithoutTransactionDiscount = new Decimal(0)

  //Do calc here because Im not gonna use it anywhere else
  for (const item of Object.values(form.transaction.items)) {
    const qty = new Decimal(item.__qty)
    const price = new Decimal(item.__price)

    //Calc subtotal
    if(item.__discount > 0) {
      const newPrice = new Decimal(item.__new_price)
      subtotal = subtotal.plus(newPrice.times(qty))
    } else {
      subtotal = subtotal.plus(price.times(qty))
    }

    //Calc subtotal without discounts
    subtotalWithoutDiscount = subtotalWithoutDiscount.plus(price.times(qty))
  }

  //Set this for popup
  subtotalWithoutTransactionDiscount = subtotal

  //Do calculations with transaction discount
  if(form.transaction.discount > 0)
    subtotal = new Decimal(calcDiscount(subtotal, form.transaction.discount, form.transaction.discountType))

  //Calc savings, tax, total
  const savings = subtotalWithoutDiscount.minus(subtotal)
  const tax = calcTaxTotal(subtotal, store.value.tax)
  const total = calcTotal(subtotal, tax)
  const change = calcChange(new Decimal(cash).plus(new Decimal(card)).plus(new Decimal(check)), total)

  //Set form
  form.transaction.subtotal = subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  form.transaction.no_discount_subtotal = subtotalWithoutDiscount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  form.transaction.no_transaction_discount_subtotal = subtotalWithoutTransactionDiscount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  form.transaction.savings = savings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  form.transaction.taxTotal = tax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  form.transaction.total = total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  form.transaction.cash = form.transaction.cash
  form.transaction.card = form.transaction.card
  form.transaction.check = form.transaction.check
  form.transaction.change = parseFloat(change)
}

//Sets a inventory value for components to set
function setInventory(data) {
  store.value.inventory = data
}

//Toggles Payment Popup
function togglePaymentPopup(active) {
  if(active)
    paymentRef.value.openPopup(form.transaction)
  else
    paymentRef.value.closePopup()
}

function createTransaction(paymentForm) {
  const { cash, card, check, cardType, checkNumber } = paymentForm

  //Set form
  form.transaction.cash = cash
  form.transaction.card = card
  form.transaction.check = check
  form.transaction.cardType = cardType
  form.transaction.checkNumber = checkNumber

  calcTransactionTotal()

  emits('createTransaction', store.value, form.transaction)
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
  togglePaymentPopup,
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
