<template>
  <div v-if="!loading.loading" style="height: calc(100vh - 215px); width: calc(100vw - 140px); margin: 0 32px 0 auto;">
    
    <div class="flex justify-center py-4 select-none">
      <el-segmented v-model="tab" :options="options" />
    </div>


    <el-table v-if="tab === 'transaction'" :data="transactions" style="width: 100%; height: 100%;" table-layout="auto">
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="user.name" label="Cashier">
        <template #default="scope">
          <div>
            <span v-if="scope.row.user?.name">{{scope.row.user.name}}</span>
            <span v-else>{{scope.row.name}}</span>
          </div>
        </template>
      </el-table-column>

      <TransactionTable />

      <el-table-column label="Payment">
        <template #default="scope">
          <div v-if="scope.row.payment === 'cash'">
            <div>
              <div class="one-line">Cash: <b>${{parseFloat(scope.row.cash).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>
              <div v-if="parseFloat(scope.row.change) > 0" class="one-line">Change: ${{scope.row.change}}<b></b></div>
            </div>
          </div>
          <div v-if="scope.row.payment === 'card'">
            <div class="one-line">Card: <b class="capitalize">{{scope.row.card}}</b></div>
          </div>
          <div v-if="scope.row.payment === 'check'">
            <div class="one-line">Check: <b>{{scope.row.check}}</b></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="total" label="Total" />
      <el-table-column prop="profit" label="Profit" />
      <el-table-column label="Operations">
        <template #default="scope">
          <el-button size="small" type="success" @click="printReceipt(scope.row)">
            Print Receipt
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-table v-if="tab === 'layaway'" :data="layaway" style="width: 100%; height: 100%;" table-layout="auto">
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="user.name" label="Customer">
        <template #default="scope">
          <div>
            <div><b>Name:</b> {{scope.row.customer.name}}</div>
            <div v-if="scope.row.customer.phone"><b>Phone:</b> {{formatPhoneNumber(scope.row.customer.phone)}}</div>
            <div v-if="scope.row.customer.email"><b>Email:</b> {{scope.row.customer.email}}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="user.name" label="Cashier">
        <template #default="scope">
          <div>
            <span v-if="scope.row.user?.name">{{scope.row.user.name}}</span>
            <span v-else>{{scope.row.name}}</span>
          </div>
        </template>
      </el-table-column>

      <TransactionTable />

      <el-table-column prop="total" label="Total" />
      <el-table-column label="Status">
        <template #default="scope">
          <div v-if="scope.row.status === 'paid'">
            <el-tag size="small" type="success">Paid</el-tag>
          </div>
          <div v-if="scope.row.status === 'pending'">
            <el-tag size="small" type="warning">Pending</el-tag>
          </div>
          <div v-if="scope.row.status === 'declined'">
            <el-tag size="small" type="danger">Declined</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Operations">
        <template #default="scope">
          <div class="flex flex-col justify-center gap-3">
            <div v-if="scope.row.status !== 'paid'">
              <el-button size="small" type="success" class="w-full" @click="openPaymentPrompt(scope.row)">
                Confirm Payment
              </el-button>
            </div>
            <div v-if="scope.row.status !== 'pending'">
              <el-button size="small" type="warning" class="w-full" @click="setStatus(scope.row, 'pending')">
                Set Pending
              </el-button>
            </div>
            <div v-if="scope.row.status !== 'declined'">
              <el-button size="small" type="danger" class="w-full" @click="setStatus(scope.row, 'declined')">
                Cancel Invoice
              </el-button>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <CashierPaymentType ref="paymentTypeRef"
      v-model:payment="form.layaway.payment"
      v-model:cash="form.layaway.cash"
      v-model:card="form.layaway.card"
      v-model:check="form.layaway.check"
      :loading="loading.confirmPayment"
      :total="form.layaway.total"
      @createTransaction="confirmPayment"
    />
  </div>
</template>

<script setup>
//Imports
const pinia = useStore()
const { notify } = useNotification()
const { formatDate, formatPhoneNumber } = useFormatter()
const { calcSubtotal, calcTaxTotal, calcTotal, calcChange } = useCalculations()
const { isBoss, getPermissions } = useChecks()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const transactions = ref([])
const layaway = ref([])
const inventory = ref(null)
const tab = ref('transaction')
const options = [
  { label: 'Transaction', value: 'transaction', icon: 'uil:transaction' },
  { label: 'Layaway', value: 'layaway', icon: 'hugeicons:invoice-03'},
]

//Element Reference
const paymentTypeRef = ref(null)

//Form
const loading = reactive({ loading: true, confirmPayment: false })
const form = reactive({
  layaway: {
    item: null,
    payment: 'cash',
    cash: '',
    card: '',
    check: '',
    total: '',
  }
})

const initialLayaway = { item: null, payment: 'cash', cash: '', card: '', check: '', total: '' }
const $resetLayaway = () => { form.layaway = initialLayaway }

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
  await getInventory()
  loading.loading = false
})
//Mount

//Make Request
async function getTransactions() {
  //Make Request
  transactions.value = await useFetchApi(`/api/protected/transaction/${storeId.value}`)

  //Setup data
  doCalc(transactions.value)

  //Test Data
  //console.log(JSON.stringify(transactions.value))
}

async function getLayaway() {
  //Make Request
  layaway.value = await useFetchApi(`/api/protected/layaway/${storeId.value}`)

  //Setup data
  doCalc(layaway.value)

  //Test Data
  // console.log(JSON.stringify(layaway.value))
}

async function getInventory() {
  //Make Request
  inventory.value = await useFetchApi(`/api/protected/inventory/${storeId.value}`)

  //Test Data
  console.log(JSON.stringify(inventory.value))
}

function openPaymentPrompt(layaway) {
  const total = layaway.total.replace(/,/g, '')
  $resetLayaway()

  form.layaway.item = layaway
  form.layaway.total = total
  form.layaway.cash = total

  paymentTypeRef.value.openPopup(true)
}

async function confirmPayment() {
  //Setup data
  const {item, payment, cash, card, check} = form.layaway
  //Make request
  loading.confirmPayment = true
  const response = await useFetchApi(`/api/protected/layaway/set-status`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      id: item.id,
      status: 'paid',
      prev_status: item.status,
      items: item.items,
      payment: payment,
      cash: cash,
      card: card,
      check: check,
      quantity_column: inventory.value.quantity_column
    }
  })
  loading.confirmPayment = false

  //Display error
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  //Display success
  notify({ title: 'Success', text: response.message, type: 'success'})

  //Set new layaway
  const calcLayaway = doCalc([response.layaway])[0]
  layaway.value = layaway.value.map(transaction => (transaction.id === item.id ? calcLayaway : transaction))

  //Close popup
  paymentTypeRef.value.openPopup(false)
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
      payment: '',
      cash: '',
      card: '',
      check: '',
      quantity_column: inventory.value.quantity_column
    }
  })

  //Display error
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  //Display success
  notify({ title: 'Success', text: response.message, type: 'success'})

  //Set new layaway
  const calcLayaway = doCalc([response.layaway])[0]
  layaway.value = layaway.value.map(transaction => (transaction.id === item.id ? calcLayaway : transaction))
}

//Do transaction calculations
function doCalc(items) {
  for (const transaction of items) {
    const {subtotal, noDiscountSubtotal, savings, profit} = calcSubtotal(transaction.items)
    const taxTotal = calcTaxTotal(subtotal, transaction.tax)
    const total = calcTotal(subtotal, taxTotal)
    transaction.date = formatDate(transaction.timestamp)
    transaction.tax = transaction.tax.toFixed(2)
    transaction.subtotal = subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.tax_total = taxTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.savings = savings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.total = total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.profit = profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.change = transaction.payment === 'cash' ? calcChange(transaction.cash, total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0
  }

  return items
}

//Print receipt
async function printReceipt(transaction) {
  //Setup data
  const {items, tax, subtotal, tax_total, savings, total, payment, cash, card, change} = transaction

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
      payment: payment,
      cash: cash.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
      card: card,
      change: change
    }
  })

  //Display error
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  //Display success
  notify({ title: 'Success', text: response.message, type: 'success'})
}
</script>

<style scoped>
.one-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.center {
  text-align: center;
}
</style>