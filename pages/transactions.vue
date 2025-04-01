<template>
  <div v-if="!loading.loading" style="height: calc(100vh - 215px); width: calc(100% - 70px); margin: 0 32px 0 auto;">
    <!-- Tabs -->
    <div class="flex justify-center py-4 select-none">
      <el-segmented v-model="tab" :options="options" />
    </div>

    <!-- Transaction -->
    <div v-if="tab === 'transaction'">
      <div class="flex items-center flex-wrap gap-2 bg-[#090909] py-2 px-6">
        <!-- SEARCH -->
        <div class="max-w-sm mx-auto w-full">
          <el-input v-model="form.search.transaction.query" size="large" :placeholder="$t(`label.search`)" clearable>
            <template #suffix>
              <el-dropdown placement="bottom-end" trigger="click">
                <span class="px-3 py-1 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">                    
                  <Icon class="text-lg" name="line-md:filter-filled" />
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <div class="text-base py-2 px-3"><label>{{$t(`title.Search By`)}}</label></div>
                    <el-checkbox-group v-model="form.search.transaction.checked" class="flex flex-col" :min="1" @change="pinia.setStaticFilters('transaction', form.search.transaction.checked)">
                      <el-checkbox v-for="filter in ['id', 'date', 'cashier', 'product']" :key="filter" class="!mx-0 px-4 !h-10" :value="filter">{{ $t(`title.${filter}`) }}</el-checkbox>
                    </el-checkbox-group>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </div>
        <!-- SEARCH -->
      </div>
      <el-table :data="filteredTransaction" style="width: 100%; height: 100%;" table-layout="auto">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="date" :label="$t('label.Date')" />
        <el-table-column prop="name" :label="$t('label.Cashier')" />

        <TransactionTable />

        <el-table-column :label="$t('label.Payment')">
          <template #default="scope">
            <div v-if="scope.row.cash > 0" class="one-line">{{$t('label.Cash')}}: <b>${{parseFloat(scope.row.cash).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>
            <div v-if="scope.row.card > 0" class="one-line">{{$t('label.Card')}}: <b class="capitalize">${{parseFloat(scope.row.card).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}} ({{scope.row.card_type}})</b></div>
            <div v-if="scope.row.check > 0" class="one-line">{{$t('label.Check')}}: <b>${{parseFloat(scope.row.check).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}} ({{scope.row.check_number}})</b></div>
            <div v-if="parseFloat(scope.row.change) > 0" class="one-line">{{$t('label.Change')}}: <b>${{scope.row.change}}</b></div>
          </template>
        </el-table-column>
        <el-table-column prop="total" :label="$t('label.Total')" />
        <el-table-column prop="profit" :label="$t('label.Profit')" />
        <el-table-column :label="$t('label.Operations')">
          <template #default="scope">
            <el-button size="small" type="success" @click="printReceipt(scope.row)">
              {{$t('btn.Print Receipt')}}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Layaway -->
    <div v-if="tab === 'layaway'">
      <div class="flex items-center flex-wrap gap-2 bg-[#090909] py-2 px-6">
        <!-- SEARCH -->
        <div class="max-w-sm mx-auto w-full">
          <el-input v-model="form.search.layaway.query" size="large" :placeholder="$t(`label.search`)" clearable>
            <template #suffix>
              <el-dropdown placement="bottom-end" trigger="click">
                <span class="px-3 py-1 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">                    
                  <Icon class="text-lg" name="line-md:filter-filled" />
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <div class="text-base py-2 px-3"><label>{{$t(`title.Search By`)}}</label></div>
                    <el-checkbox-group v-model="form.search.layaway.checked" class="flex flex-col" :min="1" @change="pinia.setStaticFilters('layaway', form.search.layaway.checked)">
                      <el-checkbox v-for="filter in ['id', 'date', 'cashier', 'customer', 'product', 'status']" :key="filter" class="!mx-0 px-4 !h-10" :value="filter">{{ $t(`title.${filter}`) }}</el-checkbox>
                    </el-checkbox-group>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </div>
        <!-- SEARCH -->
      </div>
      <el-table :data="filteredLayaway" style="width: 100%; height: 100%;" table-layout="auto">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="date" :label="$t('label.Date')" />
        <el-table-column prop="name" :label="$t('label.Cashier')" />

        <el-table-column prop="customer.name" :label="$t('label.Customer')">
          <template #default="scope">
            <div>
              <div class="truncate"><b>{{$t('label.Name')}}:</b> {{scope.row.customer.name}}</div>
              <div v-if="scope.row.customer.phone" class="truncate"><b>{{$t('label.Phone')}}:</b> {{formatPhoneNumber(scope.row.customer.phone)}}</div>
              <div v-if="scope.row.customer.email" class="truncate"><b>{{$t('label.Email')}}:</b> {{scope.row.customer.email}}</div>
            </div>
          </template>
        </el-table-column>

        <TransactionTable />

        <el-table-column prop="total" :label="$t('label.Total')" />
        <el-table-column :label="$t('label.Status')">
          <template #default="scope">
            <div v-if="scope.row.status === 'paid'">
              <el-tag size="small" type="success">{{$t('label.Paid')}}</el-tag>
            </div>
            <div v-if="scope.row.status === 'pending'">
              <el-tag size="small" type="warning">{{$t('label.Pending')}}</el-tag>
            </div>
            <div v-if="scope.row.status === 'declined'">
              <el-tag size="small" type="danger">{{$t('label.Declined')}}</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Operations">
          <template #default="scope">
            <div class="flex flex-col justify-center gap-3">
              <div v-if="scope.row.status !== 'paid'">
                <el-button size="small" type="success" class="w-full" @click="openPaymentPrompt(scope.row)">
                  {{$t('btn.Confirm Payment')}}
                </el-button>
              </div>
              <div v-if="scope.row.status !== 'pending'">
                <el-button size="small" type="warning" class="w-full" @click="setStatus(scope.row, 'pending')">
                  {{$t('btn.Set Pending')}}
                </el-button>
              </div>
              <div v-if="scope.row.status !== 'declined'">
                <el-button size="small" type="danger" class="w-full" @click="setStatus(scope.row, 'declined')">
                  {{$t('btn.Cancel Invoice')}}
                </el-button>
              </div>
              <div>
                <el-select :placeholder="$t('btn.Invoice Menu')">
                  <el-option :label="$t('btn.View Invoice')" value="" @click="pdfComponent.openPopup('view', store, scope.row)" />
                  <el-option :label="$t('btn.Download Invoice')" value="" @click="pdfComponent.openPopup('download', store, scope.row)" />
                  <el-option :label="$t('btn.Email Invoice')" value="" @click="pdfComponent.openPopup('email', store, scope.row)" />
                </el-select>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Customer -->
    <div v-if="tab === 'customer'">
      <div class="flex items-center flex-nowrap gap-2 bg-[#090909] py-2 px-6 mb-2 rounded-t-[6px]">
        <el-dropdown placement="bottom-start" trigger="click">
          <span class="p-2 mr-4 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">
            {{$t(`label.menu`)}}
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="createCustomerRef.openPopup(true)">
                <Icon class="text-green-500 mr-3 mt-[1px]" name="material-symbols:person-add-rounded" /> {{$t(`label.Create Customer`)}}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <!-- SEARCH -->
        <div class="max-w-sm mx-auto w-full">
          <el-input v-model="form.search.customer.query" size="large" :placeholder="$t(`label.search`)" clearable>
            <template #suffix>
              <el-dropdown placement="bottom-end" trigger="click">
                <span class="px-3 py-1 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">                    
                  <Icon class="text-lg" name="line-md:filter-filled" />
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <div class="text-base py-2 px-3"><label>{{$t(`title.Search By`)}}</label></div>
                    <el-checkbox-group v-model="form.search.customer.checked" class="flex flex-col" :min="1" @change="pinia.setStaticFilters('customer', form.search.customer.checked)">
                      <el-checkbox v-for="filter in ['id', 'customer', 'company', 'email', 'phone']" :key="filter" class="!mx-0 px-4 !h-10" :value="filter">{{ $t(`title.${filter}`) }}</el-checkbox>
                    </el-checkbox-group>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-input>
        </div>
        <!-- SEARCH -->
      </div>

      <div>
        <CustomerModifyCustomer ref="createCustomerRef" :storeId="storeId" @addCustomer="addCustomer" />
        <CustomerModifyCustomer ref="editCustomerRef" type="Edit"
          :id="form.customer?.id"
          :name="form.customer?.name"
          :email="form.customer?.email"
          :phone="form.customer?.phone"
          :company="form.customer?.company"
          :address="form.customer?.address"
          :city="form.customer?.city"
          :zipcode="form.customer?.zipcode"
          :state="form.customer?.state"
          :country="form.customer?.country"
          :storeId="storeId"
          @editCustomer="editCustomer"
        />
        <CustomerDeleteCustomer ref="deleteCustomerRef" :storeId="storeId" :id="form.customer?.id" :name="form.customer?.name" @deleteCustomer="deleteCustomer" />
      </div>

      <el-table :data="filteredCustomer" style="width: 100%; height: 100%;" table-layout="auto">
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="name" :label="$t('label.Customer')"  />
        <el-table-column prop="company" :label="$t('label.Company')" />
        <el-table-column :label="$t('label.Contact')">
          <template #default="scope">
            <div v-if="scope.row.email">{{scope.row.email}}</div>
            <div v-if="scope.row.phone">{{formatPhoneNumber(scope.row.phone)}}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('label.Address')">
          <template #default="scope">
            <div v-if="scope.row.address">
              <div>{{scope.row.address}}</div>
              <div>
                <span v-if="scope.row.city">{{scope.row.city}},&nbsp;</span>
                <span v-if="scope.row.zipcode">{{scope.row.zipcode}}</span>
                <span v-if="scope.row.country"><span v-if="scope.row.zipcode">,&nbsp;</span>{{scope.row.country}}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column :label="$t('label.Operations')" width="140">
          <template #default="scope">
            <div class="flex flex-col justify-center gap-3">
              <div>
                <el-button size="small" type="warning" class="w-full" @click="openCustomerEdit(scope.row)">
                  {{$t('label.Edit Customer')}}
                </el-button>
              </div>
              <div>
                <el-button size="small" type="danger" class="w-full" @click="form.customer = scope.row, deleteCustomerRef.openPopup(true)">
                  {{$t('label.Delete Customer')}}
                </el-button>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Dialog -->
    <CashierPayment ref="paymentRef" :loading="loading.confirmPayment" :total="form.layaway?.total" @createTransaction="confirmPayment" />
    <!-- Dialog -->

    <!-- Pdf -->
    <PdfComponent ref="pdfComponent" />
    <!-- Pdf -->
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'store-required', 'language']
})

//Imports
const pinia = useStore()
const { $eventBus } = useNuxtApp()
const { sendNotification } = useHelpers()
const { calcTransactions } = useCalculations()
const { formatDate, formatPhoneNumber } = useFormatter()
const { isBoss, getPermissions } = useChecks()
const { handleGetRequest } = useHandleRequests()
const { $t, $td } = useNuxtApp()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const transactions = ref([])
const layaway = ref([])
const customers = ref([])
const store = ref(null)
const inventory = ref(null)
const tab = ref('transaction')
const options = [
  { label: $t('tabs.Transaction'), value: 'transaction', icon: 'uil:transaction' },
  { label: $t('tabs.Layaway'), value: 'layaway', icon: 'hugeicons:invoice-03'},
  { label: $t('tabs.Customer'), value: 'customer', icon: 'material-symbols:person-rounded'}
]

//Filters transaction depending on search query
const filteredTransaction = computed(() => {
  let { query, checked } = form.search.transaction
  if (!query) return transactions.value
  query = query.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()
  
  return transactions.value.filter((transaction) => {
    return checked.some((key) => {
      if (key === 'cashier') {
        // Compare with cashier's name
        return transaction.name.toLowerCase().replace(/[^a-z0-9]/gi, '').trim().includes(query)
      }

      if (key === 'product') {
        // Loop through items and check their names
        return transaction.items.some((item) => {
          const cleanedItemName = item.name.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()
          return cleanedItemName.includes(query)
        })
      }

      // Handle other keys normally
      if (transaction[key] && transaction[key].toString().toLowerCase().replace(/[^a-z0-9]/gi, '').trim().includes(query)) {
        return true
      }

      return false
    })
  })
})

//Filters layaway depending on search query
const filteredLayaway = computed(() => {
  let { query, checked } = form.search.layaway
  if (!query) return layaway.value
  query = query.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()
  
  return layaway.value.filter((layaway) => {
    return checked.some((key) => {
      if (key === 'cashier') {
        // Compare with cashier's name
        return layaway.name.toLowerCase().replace(/[^a-z0-9]/gi, '').trim().includes(query)
      }

      if (key === 'customer') {
        // Compare with customer's name
        return layaway.customer.name.toLowerCase().replace(/[^a-z0-9]/gi, '').trim().includes(query)
      }

      if (key === 'product') {
        // Loop through items and check their names
        return layaway.items.some((item) => {
          const cleanedItemName = item.name.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()
          return cleanedItemName.includes(query)
        })
      }

      // Handle other keys normally
      if (layaway[key] && layaway[key].toString().toLowerCase().replace(/[^a-z0-9]/gi, '').trim().includes(query)) {
        return true
      }

      return false
    })
  })
})

//Filters customer depending on search query
const filteredCustomer = computed(() => {
  let { query, checked } = form.search.customer
  if (!query) return customers.value
  query = query.toLowerCase().replace(/[^a-z0-9]/gi, '').trim()
  
  return customers.value.filter((customer) => {
    return checked.some((key) => {
      if (key === 'customer') {
        // Compare with customer's name
        return customer.name.toLowerCase().replace(/[^a-z0-9]/gi, '').trim().includes(query)
      }

      // Handle other keys normally
      if (customer[key] && customer[key].toString().toLowerCase().replace(/[^a-z0-9]/gi, '').trim().includes(query)) {
        return true
      }

      return false
    })
  })
})

//Element Reference
const paymentRef = ref(null)
const createCustomerRef = ref(null)
const editCustomerRef = ref(null)
const deleteCustomerRef = ref(null)
const pdfComponent = ref(null)

//Form
const loading = reactive({ loading: true, confirmPayment: false })
const form = reactive({
  search: {
    transaction: { query: '', checked: pinia.getStaticFilters('transaction')},
    layaway: { query: '', checked: pinia.getStaticFilters('layaway')},
    customer: { query: '', checked: pinia.getStaticFilters('customer')},
  },
  layaway: null,
  customer: null,
})

const initialLayaway = { total: '' }
const $resetLayaway = () => { form.layaway = initialLayaway }
const initialCustomer = { id: 0, name: '', email: '', phone: '', company: '', address: '', city: '', zipcode: '', state: '', country: '' }
const $resetCustomer = () => { form.customer = initialLayaway }

//Mount
onBeforeMount(async () => {
  //If you are not permitted to be here then return to dashboard
  if(!isBossAccount.value) {
    const permissions = await getPermissions()

    if(!permissions.make_transactions) {
      window.location.href = '/dashboard'
      return
    }
  }

  await getTransactions()
  await getLayaway()
  await getCustomers()
  await getStore()
  loading.loading = false
})

// Set up the event listener when the component mounts
onMounted(() => {
  $eventBus.on('fetchTransactions', getTransactions)
  $eventBus.on('fetchLayaways', getLayaway)
  $eventBus.on('fetchCustomers', getCustomers)
})

// Clean up the event listener when the component is unmounted
onBeforeUnmount(() => {
  $eventBus.off('fetchTransactions', getTransactions)
  $eventBus.off('fetchLayaways', getLayaway)
  $eventBus.off('fetchCustomers', getCustomers)
})
//Mount

//Make Request
async function getTransactions() {
  //Make Request
  transactions.value = await handleGetRequest(`/api/protected/transaction/${storeId.value}`)

  //Setup data
  calcTransactions(transactions.value)

  //Test Data
  // console.log(JSON.stringify(transactions.value))
}

async function getLayaway() {
  //Make Request
  layaway.value = await handleGetRequest(`/api/protected/layaway/${storeId.value}`)
  
  //Setup data
  calcTransactions(layaway.value)

  //Test Data
  console.log(JSON.stringify(layaway.value))
}

//Fetch customers
async function getCustomers() {
  customers.value = await handleGetRequest(`/api/protected/customer/${storeId.value}`)
  
  //Test Data
  // console.log(JSON.stringify(customers.value))
}

//Gets the store the user is in
async function getStore() {
  //Make Request
  store.value = await handleGetRequest(`/api/protected/store/${storeId.value}`)
  
  store.value.phone = formatPhoneNumber(store.value.phone)
  //Set inventory
  inventory.value = store.value.inventory
  delete store.value.inventory

  //Test Data
  // console.log(JSON.stringify(store.value))
  // console.log(JSON.stringify(inventory.value))
}

function openPaymentPrompt(layaway) {
  form.layaway = layaway

  paymentRef.value.openPopup()
}

async function openCustomerEdit(customer) {
  form.customer = customer
  await nextTick()
  editCustomerRef.value.openPopup(true)
}

async function confirmPayment(paymentForm) {
  //Setup data
  const { cash, card, check, cardType, checkNumber } = paymentForm
  //Make request
  loading.confirmPayment = true
  const response = await useFetchApi(`/api/protected/layaway/set-status`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      id: form.layaway.id,
      status: 'paid',
      prev_status: form.layaway.status,
      items: form.layaway.items,
      cash: cash,
      card: card,
      check: check,
      card_type: cardType,
      check_number: checkNumber,
      quantity_column: inventory.value.quantity_column
    }
  })
  loading.confirmPayment = false

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Display success
  sendNotification(response.message, 'success')

  //Set new layaway
  const calcLayaway = calcTransactions([response.layaway])[0]
  layaway.value = layaway.value.map(transaction => (transaction.id === form.layaway.id ? calcLayaway : transaction))

  //Close popup
  paymentRef.value.closePopup(false)
}

async function setStatus(item, status) {
  //Make request
  const response = await useFetchApi(`/api/protected/layaway/set-status`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      id: item.id,
      status: status,
      prev_status: item.status,
      items: item.items,
      cash: 0,
      card: 0,
      check: 0,
      card_type: '',
      check_number: '',
      quantity_column: inventory.value.quantity_column
    }
  })

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Display success
  sendNotification(response.message, 'success')

  //Set new layaway
  const calcLayaway = calcTransactions([response.layaway])[0]
  layaway.value = layaway.value.map(transaction => (transaction.id === item.id ? calcLayaway : transaction))
}

//Print receipt
async function printReceipt(transaction) {
  //Setup data
  const {items, tax, subtotal, tax_total, savings, total, cash, card, check, card_type, change, discount, discount_type} = transaction

  //Make request
  const response = await useFetchApi(`/api/protected/transaction/print`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      items: items,
      tax: tax,
      subtotal: subtotal,
      tax_total: tax_total,
      savings: savings,
      total: total,
      cash: cash,
      card: card,
      check: check,
      card_type: card_type,
      change: change,
      discount: discount,
      discount_type: discount_type
    }
  })

  //Display error
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    return
  }

  //Display success
  sendNotification(response.message, 'success')
}

//Adds customers to the list
function addCustomer(customer) {
  customers.value.push(customer)
}

//Edits specific customer from the list
function editCustomer(customer) {
  customers.value = customers.value.map(user => (user.id === customer.id ? customer : user))
}

//Deletes specific customer from the list
function deleteCustomer(id) {
  customers.value = customers.value.filter(user => user.id !== id)
}
</script>

<style scoped>
.one-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>