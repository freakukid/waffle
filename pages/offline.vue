<template>
  <div>
    <h1 class="text-3xl pt-16 text-center">{{$t("Offline Manager")}}</h1>

    <div v-if="requests.length || customerRequests.length">
      <!-- LOGS -->
      <div v-if="logs.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">{{$t("Pending Inventory Operations")}}</h1>
        <el-table :data="logs" style="width: 100%; height: 100%;" table-layout="auto" >
          <el-table-column prop="date" :label="$t('label.Date')" />
          <el-table-column prop="user.name" :label="$t('label.User')" />
          <el-table-column prop="description" :label="$t('label.Action')">
            <template #default="scope">
              <div v-html="$t(`label.${scope.row.description}`)" />
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- LOGS -->

      <!-- TRANSACTIONS -->
      <div v-if="transactions.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">{{$t("Operations")}}</h1>
        <el-table :data="transactions" style="width: 100%; height: 100%;" table-layout="auto">
          <el-table-column prop="date" :label="$t('label.Date')" />
          <el-table-column prop="name" :label="$t('label.Cashier')" />

          <TransactionTable />

          <el-table-column :label="$t('label.Payment')">
            <template #default="scope">
              <div v-if="scope.row.payment === 'cash'">
                <div>
                  <div class="one-line">{{$t("label.Cash")}}: <b>${{parseFloat(scope.row.cash).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>
                  <div v-if="parseFloat(scope.row.change) > 0" class="one-line">{{$t("label.Change")}}: ${{scope.row.change}}<b></b></div>
                </div>
              </div>
              <div v-if="scope.row.payment === 'card'">
                <div class="one-line">{{$t("label.Card")}}: <b class="capitalize">{{scope.row.card}}</b></div>
              </div>
              <div v-if="scope.row.payment === 'check'">
                <div class="one-line">{{$t("label.Check")}}: <b>{{scope.row.check}}</b></div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="total" :label="$t('label.Total')" />
        </el-table>
      </div>
      <!-- TRANSACTIONS -->

      <!-- LAYAWAYS -->
      <div v-if="layaways.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">{{$t("Pending Layaways")}}</h1>
        <el-table :data="layaways" style="width: 100%; height: 100%;" table-layout="auto">
          <el-table-column prop="date" :label="$t('label.Date')" />

          <el-table-column prop="customer.name" :label="$t('label.Customer')">
            <template #default="scope">
              <div>
                <div class="truncate"><b>{{$t("label.Name")}}:</b> {{scope.row.customer.name}}</div>
                <div v-if="scope.row.customer.phone" class="truncate"><b>{{$t("label.Phone")}}:</b> {{formatPhoneNumber(scope.row.customer.phone)}}</div>
                <div v-if="scope.row.customer.email" class="truncate"><b>{{$t("label.Email")}}:</b> {{scope.row.customer.email}}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="name" :label="$t('label.Cashier')" />

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

          <el-table-column :label="$t('label.Operations')">
            <template #default="scope">
              <div class="flex flex-col justify-center gap-3">
                <div>
                  <el-select :placeholder="$t('btn.Invoice Menu')">
                    <el-option :label="$t('btn.View Invoice')" value="" @click="pdfComponent.openPopup('view', store, scope.row)" />
                    <el-option :label="$t('btn.Download Invoice')" value="" @click="pdfComponent.openPopup('download', store, scope.row)" />
                  </el-select>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- LAYAWAYS -->

      <!-- CUSTOMERS -->
      <div v-if="customers.length" style="width: calc(100vw - 140px); padding-top: 32px; margin: 0 32px 0 auto;">
        <h1 class="text-2xl mb-8">{{$t("Pending New Customers")}}</h1>
        <el-table :data="customers" style="width: 100%; height: 100%;" table-layout="auto">
          <el-table-column prop="name" :label="$t('label.Customer')" />
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
        </el-table>
      </div>
      <!-- CUSTOMERS -->
    </div>

    <div v-else>
      <h1 class="my-8 text-center">{{$t("Nothing in queue!")}}</h1>
    </div>

    <!-- Pdf -->
    <PdfComponent ref="pdfComponent" />
    <!-- Pdf -->
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'language']
})

//Import
const pinia = useStore()
const offlineStore = useOfflineStore()
const { formatPhoneNumber } = useFormatter()
const { getLogDescription } = useHelpers()
const { handleGetRequest } = useHandleRequests()
const { calcSubtotal, calcTaxTotal, calcTotal, calcChange } = useCalculations()
const { $td } = useNuxtApp()

//Data
const requests = computed(offlineStore.getRequests)
const customerRequests = computed(offlineStore.getCustomerRequests)
const storeId = computed(pinia.getStore)
const store = ref(null)

//Element Reference
const pdfComponent = ref(null)

const logs = computed(() => {
  const list = (requests.value || []).filter(item => item.category === 'inventory').map(item => item.log)
  return getLogDescription(list)
})

const transactions = computed(() => {
  return (requests.value || []).filter(item => item.category === 'transaction').map(item => item.transaction)
})

const layaways = computed(() => {
  const list = (requests.value || []).filter(item => item.category === 'layaway').map(item => item.layaway)
  return doCalc(list)
})

const customers = computed(() => {
  return (customerRequests.value || []).map(item => item.customer)
})

//General
const loading = reactive({ startedLoading: true })

//Mount
onBeforeMount(async () => {
  await getStore()
  loading.startedLoading = false
})
//Mount

//Gets the store the user is in
async function getStore() {
  //Make Request
  store.value = await handleGetRequest(`/api/protected/store/${storeId.value}`)
  store.value.phone = formatPhoneNumber(store.value.phone)

  //Test Data
  // console.log(JSON.stringify(store.value))
  // console.log(JSON.stringify(inventory.value))
}

//Do transaction calculations
function doCalc(items) {
  for (const transaction of items) {
    const {subtotal, noDiscountSubtotal, savings, profit} = calcSubtotal(transaction.items)
    const taxTotal = calcTaxTotal(subtotal, transaction.tax)
    const total = calcTotal(subtotal, taxTotal)
    transaction.tax = parseFloat(transaction.tax).toFixed(2)
    transaction.subtotal = subtotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.tax_total = taxTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.savings = savings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.total = total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.profit = profit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    transaction.change = transaction.payment === 'cash' ? calcChange(transaction.cash, total).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0
  }

  return items
}
</script>