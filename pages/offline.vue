<template>
  <div>
    <h1 class="text-3xl pt-16 text-center">Offline Manager</h1>

    <div v-if="requests.length">
      <!-- LOGS -->
      <div v-if="logs.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">Pending Inventory Operations</h1>
        <el-table :data="logs" style="width: 100%; height: 100%;" table-layout="auto" >
          <el-table-column prop="date" label="Date" />
          <el-table-column prop="user.name" label="User" />
          <el-table-column prop="description" label="Action">
            <template #default="scope">
              <div v-html="scope.row.description" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- LOGS -->

      <!-- TRANSACTIONS -->
      <div v-if="transactions.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">Pending Transactions</h1>
        <el-table :data="transactions" style="width: 100%; height: 100%;" table-layout="auto">
          <el-table-column prop="date" label="Date" />
          <el-table-column prop="name" label="Cashier" />

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
        </el-table>
      </div>
      <!-- TRANSACTIONS -->

      <!-- LAYAWAYS -->
      <div v-if="layaways.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">Pending Layaways</h1>
        <el-table :data="layaways" style="width: 100%; height: 100%;" table-layout="auto">
          <el-table-column prop="date" label="Date" />

          <el-table-column prop="customer.name" label="Customer">
            <template #default="scope">
              <div>
                <div class="truncate"><b>Name:</b> {{scope.row.customer.name}}</div>
                <div v-if="scope.row.customer.phone" class="truncate"><b>Phone:</b> {{formatPhoneNumber(scope.row.customer.phone)}}</div>
                <div v-if="scope.row.customer.email" class="truncate"><b>Email:</b> {{scope.row.customer.email}}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="name" label="Cashier" />

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
                <div>
                  <el-select placeholder="Invoice Menu">
                    <el-option label="View Invoice" value="" @click="pdfComponent.openNotesPopup('view', store, scope.row)" />
                    <el-option label="Download Invoice" value="" @click="pdfComponent.openNotesPopup('download', store, scope.row)" />
                  </el-select>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- LAYAWAYS -->
    </div>

    <div v-else-if="customerRequests.length">
      <!-- CUSTOMERS -->
      <div v-if="customers.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">Pending New Customers</h1>
        <el-table :data="customers" style="width: 100%; height: 100%;" table-layout="auto">
          <el-table-column prop="name" label="Customer" />
          <el-table-column prop="company" label="Company" />
          <el-table-column label="Contact">
            <template #default="scope">
              <div v-if="scope.row.email">{{scope.row.email}}</div>
              <div v-if="scope.row.phone">{{formatPhoneNumber(scope.row.phone)}}</div>
            </template>
          </el-table-column>
          <el-table-column label="Address">
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
        </el-table>
      </div>
      <!-- CUSTOMERS -->
    </div>

    <div v-else>
      <h1 class="my-8 text-center">Nothing in queue!</h1>
    </div>

    <!-- Pdf -->
    <PdfComponent ref="pdfComponent" />
    <!-- Pdf -->
  </div>
</template>

<script setup>
//Import
const pinia = useStore()
const offlineStore = useOfflineStore()
const { formatPhoneNumber } = useFormatter()
const { getLogDescription } = useHelpers()
const requests = computed(offlineStore.getRequests)
const customerRequests = computed(offlineStore.getCustomerRequests)

//Data
const logs = computed(() => {
  return (requests.value || []).filter(item => item.category === 'inventory').map(item => item.log)
})

const transactions = computed(() => {
  return (requests.value || []).filter(item => item.category === 'transaction').map(item => item.transaction)
})

const layaways = computed(() => {
  return (requests.value || []).filter(item => item.category === 'layaway').map(item => item.layaway)
})

const customers = computed(() => {
  return (customerRequests.value || []).map(item => item.customer)
})

//General
const loading = reactive({ startedLoading: true })

//Mount
onBeforeMount(async () => {
  getLogs()
  loading.startedLoading = false
})
//Mount

function getLogs() {
  logs.value = getLogDescription(logs.value)
  
  //Test data
  // console.log(JSON.stringify(logs.value))
}
</script>