<template>
  <div v-if="product" class="py-8 mx-auto" style="width: calc(100% - 70px);">
    <el-row>
      <el-col v-if="product.name_column" :span="16">
        <el-statistic title="Name" :value="product.product[product.name_column]" />
      </el-col>
      <el-col v-if="product.discount_column" :span="8">
        <el-statistic title="Discount" :value="`${product.product[product.discount_column]}%`" />
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
    <div style="width: calc(100% - 32px);">
      <div class="flex justify-center py-4 select-none">
        <el-segmented v-model="chartType" :options="options" />
      </div>

      <client-only placeholder="Loading chart..">
        <apexchart type="line" height="350" :options="chartOptions" :series="series" />
      </client-only>
    </div>
    <!-- PROFIT CHART -->

    <!-- CHART STATS -->
    <el-row class="mt-4">
      <el-col :span="8">
        <el-statistic :title="`${chartType} Total Sales`" :value="`$${chartStats.price}`" />
      </el-col>
      <el-col :span="8">
        <el-statistic :title="`${chartType} Total Profit`" :class="{positive: chartStats.profit > 0, negative: chartStats.profit < 0}" :value="`${chartStats.profit > 0 ? '+' : chartStats.profit < 0 ? '-' : ''}${chartStats.profit}`" />
      </el-col>
      <el-col :span="8">
        <el-statistic :title="`${chartType} Total Sold`" :value="chartStats.qty" />
      </el-col>
    </el-row>
    <!-- CHART STATS -->
    
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
const { $t } = useNuxtApp()
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
const chartType = ref('Week')

//Chart
const series = ref([{ name: "Profit", data: []}])
const chartStats = reactive({price: '0.00', profit: '0.00', qty: 0})
const options = [
  { label: $t('tabs.Week'), value: 'Week' },
  { label: $t('tabs.Month'), value: 'Month' },
  { label: $t('tabs.Year'), value: 'Year'}
]
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
        const date = moment(new Date(val))
        if (chartType.value === 'Month' || chartType.value === 'Year') {
          // Find the corresponding data point
          const dataPoint = series.value[0].data.find(item => item.x === val)
          if (dataPoint) {
            const endDate = moment(new Date(dataPoint.end))
            return `${date.format('MMM DD')} - ${endDate.format('MMM DD')}`
          }
        }
        // For week or year view
        return date.format(chartType.value === 'Week' ? 'MMM DD' : 'MMM')
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
      formatter: function(val, timestamp) {
        const date = moment(new Date(val))
        if (chartType.value === 'Month' || chartType.value === 'Year') {
          // Find the corresponding data point
          const dataPoint = series.value[0].data.find(item => item.x === val)
          if (dataPoint) {
            const endDate = moment(new Date(dataPoint.end))
            return `${date.format('MMM DD')} - ${endDate.format('MMM DD')}`
          }
        }
        // For week or year view
        return date.format(chartType.value === 'Week' ? 'MMM DD' : 'MMM')
      }
    }
  }
})

//Watch
watch(chartType, () => {
  updateChart()
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
  updateChart()

  // Test data
  // console.log(JSON.stringify(product.value))
}

//Update chart
function updateChart() {
  const {chart_data, total_price, total_profit, total_qty} = calcProduct(productId.value, product.value.transactions, product.value.layaways, chartType.value)
  series.value[0].data = chart_data
  chartStats.price = total_price
  chartStats.profit = total_profit
  chartStats.qty = total_qty

  // Test data
  // console.log(JSON.stringify(series.value[0].data))
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

.positive {
  :deep(.el-statistic__number) {
    color: #96ff63;
  }
}

.negative {
  :deep(.el-statistic__number) {
    color: #ec6262;
  }
}
</style>