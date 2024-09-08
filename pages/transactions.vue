<template>
  <div v-if="!loading.startedLoading" style="height: calc(100vh - 215px);width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
    <el-table :data="transactions" style="width: 100%; height: 100%;" table-layout="auto" >
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="user.name" label="User">
        <template #default="scope">
          <div>
            <span v-if="scope.row.user?.name">{{scope.row.user.name}}</span>
            <span v-else>{{scope.row.name}}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Items Sold">
        <el-table-column label="Qty">
          <template #default="scope">
            <div v-for="item in scope.row.items" :key="item" class="center">{{item.qty}}</div>
          </template>
        </el-table-column>
        <el-table-column label="Name">
          <template #default="scope">
            <div v-for="item in scope.row.items" :key="item" class="one-line">{{item.name}}</div>
          </template>
        </el-table-column>
        <el-table-column label="Price">
          <template #default="scope">
            <div v-for="item in scope.row.items" :key="item" class="center">
              <div v-if="item.discount == 0">{{item.price}}</div>
              <div v-else>{{item.new_price}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Discount (Base Price) | Percent">
          <template #default="scope">
            <div v-for="item in scope.row.items" :key="item">
              <div v-if="item.discount == 0">&nbsp;</div>
              <div v-else class="one-line">({{item.price}}) | {{item.discount}}%</div>
            </div>
          </template>
        </el-table-column>
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
  </div>
</template>

<script setup>
//Imports
const pinia = useStore()
const { notify } = useNotification()
const { formatDate } = useFormatter()
const { calcSubtotal, calcTaxTotal, calcTotal } = useCalculations()
const { isBoss, getPermissions } = useChecks()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const transactions = ref([])

//General
const loading = reactive({ startedLoading: true })

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
  loading.startedLoading = false
})
//Mount

//Make Request
async function getTransactions() {
  //Make Request
  transactions.value = await useFetchApi(`/api/protected/transaction/${storeId.value}`)

  //Setup data
  for (const transaction of transactions.value) {
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
  }

  //Test Data
  //console.log(JSON.stringify(transactions.value))
}

//Print receipt
async function printReceipt(transaction) {
  //Setup data
  const {items, tax, subtotal, tax_total, savings, total} = transaction

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
      total: total
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