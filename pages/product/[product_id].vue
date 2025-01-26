<template>
  <div v-if="product" class="py-8 mx-auto" style="width: calc(100% - 70px);">
    <el-row>
      <el-col v-if="product.name_column" :span="24">
        <el-statistic title="Name" :value="product.product[product.name_column]" />
      </el-col>
    </el-row>
    <el-row class="mt-4">
      <el-col v-if="product.quantity_column" :span="8">
        <el-statistic title="Quantity" :value="product.product[product.quantity_column]" />
      </el-col>
      <el-col v-if="product.cost_column" :span="8">
        <el-statistic title="Cost" :value="product.product[product.cost_column]" />
      </el-col>
      <el-col v-if="product.price_column" :span="8">
        <el-statistic title="Price" :value="product.product[product.price_column]" />
      </el-col>
    </el-row>

    <!-- PROFIT CHART -->
    <client-only placeholder="Loading chart..">
      <apexchart type="line" height="350" :options="chartOptions" :series="series" />
    </client-only>
    <!-- PROFIT CHART -->
    
    <!-- DATA -->
    <el-row class="mt-4">
      <label class="text-xs mb-3">Data</label>
      <el-table class="w-full" :data="[product.product]" table-layout="auto" row-class-name="table-row" border>
        <el-table-column v-for="column in product.columns" :key="column" :prop="column" :label="column" />
      </el-table>
    </el-row>
    <!-- DATA -->

    <!-- LOGS -->
    <label class="block text-xs mt-4 mb-3">Logs</label>
    <el-table :data="product.logs" class="w-full" max-height="320" table-layout="auto" border>
      <el-table-column prop="date" label="Date" />
      <el-table-column prop="user.name" label="User" />
      <el-table-column prop="description" label="Action">
        <template #default="scope">
          <div v-html="scope.row.description" />
        </template>
      </el-table-column>
    </el-table>
    <!-- LOGS -->

    <!-- TRANSACTIONS -->
    <label class="block text-xs mt-4 mb-3">Transactions</label>
    <el-table :data="product.transactions" style="width: 100%; height: 100%;" table-layout="auto">
      <el-table-column prop="id" label="ID" />
      <el-table-column prop="date" :label="$t('label.Date')" />
      <el-table-column prop="name" :label="$t('label.Cashier')" />

      <TransactionTable />

      <el-table-column :label="$t('label.Payment')">
        <template #default="scope">
          <div v-if="scope.row.payment === 'cash'">
            <div>
              <div class="one-line">{{$t('label.Cash')}}: <b>${{parseFloat(scope.row.cash).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}}</b></div>
              <div v-if="parseFloat(scope.row.change) > 0" class="one-line">{{$t('label.Change')}}: ${{scope.row.change}}<b></b></div>
            </div>
          </div>
          <div v-if="scope.row.payment === 'card'">
            <div class="one-line">{{$t('label.Card')}}: <b class="capitalize">{{scope.row.card}}</b></div>
          </div>
          <div v-if="scope.row.payment === 'check'">
            <div class="one-line">{{$t('label.Check')}}: <b>{{scope.row.check}}</b></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="total" :label="$t('label.Total')" />
      <el-table-column prop="profit" :label="$t('label.Profit')" />
    </el-table>
    <!-- TRANSACTIONS -->

    <!-- LAYAWAY -->
    <label class="block text-xs mt-4 mb-3">Layaway</label>
    <el-table :data="product.layaways" style="width: 100%; height: 100%;" table-layout="auto">
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
    </el-table>
    <!-- LAYAWAY -->
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'store-required', 'language']
})

//Imports
import moment from 'moment'
const { handleGetRequest } = useHandleRequests()
const { getLogDescription, handleTransactionCalcs } = useHelpers()
const { calcProduct } = useCalculations()
const route = useRoute()
const pinia = useStore()

//Data
const loading = ref(false)
const storeId = computed(pinia.getStore)
const productId = computed(() => (route.params.product_id ? parseInt(route.params.product_id) : 0))
const product = ref(null)
const chartType = ref('daily')

//Chart
const series = ref([{ name: "Profit", data: []}])
const chartOptions = ref({
  chart: {
    type: 'line',
    width: '100%',
    height: 350
  },
  xaxis: {
    type: 'datetime',
    labels: {
      style: {
        colors: '#FFFFFF'  // White color for x-axis labels
      },
      formatter: function(val, timestamp) {
        return moment(new Date(timestamp)).format(chartType.value === 'daily' ? 'MMM DD' : chartType.value === 'monthly' ? 'MMM YYYY' : 'YYYY')
      }
    },
    title: {
      text: 'Date',
      style: {
        color: '#FFFFFF',
      }
    },
    axisBorder: {
      show: true,
      color: '#FFFFFF'  // White color for the x-axis line
    },
    axisTicks: {
      show: true,
      color: '#FFFFFF'  // White color for x-axis ticks
    }
  },
  yaxis: {
    title: {
      text: 'Profit',
      style: {
        color: '#FFFFFF',
      }
    },
    labels: {
      style: {
        colors: '#FFFFFF'  // White color for y-axis labels
      }
    },
    axisBorder: {
      show: true,
      color: '#FFFFFF'  // White color for the y-axis line
    },
    axisTicks: {
      show: true,
      color: '#FFFFFF'  // White color for y-axis ticks
    }
  },
  tooltip: {
    theme: 'dark',
    x: {
      formatter: function(val) {
        return moment(new Date(val)).format(chartType.value === 'daily' ? 'MMM DD, YYYY' : chartType.value === 'monthly' ? 'MMMM YYYY' :'YYYY')
      }
    }
  }
})

//Mount
onBeforeMount(async () => {
  await fetchProduct()
  loading.value = false
})

//Fetch product
async function fetchProduct() {
  product.value = await handleGetRequest(`/api/protected/product/store/${storeId.value}/item/${productId.value}`)
  product.value.logs = getLogDescription(product.value.logs)
  product.value.transactions = handleTransactionCalcs(product.value.transactions)
  product.value.layaways = handleTransactionCalcs(product.value.layaways)

  series.value[0].data = calcProduct(productId.value, product.value.transactions, product.value.layaways, chartType.value)

  // console.log(JSON.stringify(calcProduct(productId.value, product.value.transactions, product.value.layaways)))
  // console.log(JSON.stringify(product.value))
}
</script>

<style lang="scss" scoped>
.one-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
:deep(.truncate) {
  text-overflow: none;
}
</style>