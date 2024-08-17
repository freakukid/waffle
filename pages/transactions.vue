<template>
  <div style="height: calc(100vh - 215px);width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
    <el-table :data="transactions" style="width: 100%; height: 100%;" table-layout="auto" >
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="user.name" label="User" />
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
const { formatDate } = useFormatter()
const { calcSubtotal, calcTaxTotal, calcTotal } = useCalculations()
//Data
const storeId = computed(() => pinia.store)
const transactions = ref([])

//General
const loading = reactive({ startedLoading: true })

//Mount
onBeforeMount(async () => {
  await getTransactions()
  loading.startedLoading = false
})
//Mount

async function getTransactions() {
  transactions.value = await useFetchApi(`/api/protected/transaction/${storeId.value}`)

  for (const transaction of transactions.value) {
    const {subtotal, noDiscountSubtotal, savings, profit} = calcSubtotal(transaction.items)
    const taxTotal = calcTaxTotal(subtotal, transaction.tax)
    const total = calcTotal(subtotal, taxTotal)
    transaction.date = formatDate(transaction.timestamp)
    
    transaction.subtotal = subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.tax_total = taxTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.total = total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.profit = profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }
    
  console.log(JSON.stringify(transactions.value))
}

function printReceipt(transaction) {
  alert('Print Reciept')
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