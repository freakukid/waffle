<template>
  <div v-if="stats" class="py-8 mx-auto" style="width: calc(100% - 70px)">
    <!-- PROFIT CHART -->
    <div style="width: calc(100% - 32px)">
      <div class="flex justify-center py-4 select-none">
        <el-segmented v-model="chartType" :options="options" />
      </div>

      <client-only placeholder="Loading chart..">
        <apexchart
          type="line"
          height="350"
          :options="chartOptions"
          :series="series"
        />
      </client-only>
    </div>
    <!-- PROFIT CHART -->

    <!-- CHART STATS -->
    <el-row class="mt-4">
      <el-col :span="16">
        <el-statistic 
          :title="$t(`label.Store Name`)" 
          :value="stats.inventory.store.name" 
        />
      </el-col>
      <el-col :span="8">
        <el-statistic 
          :title="$t(`label.Total Transactions`)" 
          :value="Number(chartStats.transactions)" 
        />
      </el-col>
    </el-row>
    <el-row class="mt-4">
      <el-col :span="8">
        <el-statistic 
          :title="$t(`label.Total Card`)"
          :value="Number(chartStats.card)" 
          :formatter="(value) => `$${value.toFixed(2)}`"
        />
      </el-col>
      <el-col :span="8">
        <el-statistic 
          :title="$t(`label.Total Cash`)"
          :value="Number(chartStats.cash)" 
          :formatter="(value) => `$${value.toFixed(2)}`"
        />
      </el-col>
      <el-col :span="8">
        <el-statistic 
          :title="$t(`label.Total Check`)"
          :value="Number(chartStats.check)" 
          :formatter="(value) => `$${value.toFixed(2)}`"
        />
      </el-col>
    </el-row>
    <el-row class="mt-4">
      <el-col :span="8">
        <el-statistic 
          :title="$t(`label.${chartType} Total Sales`)" 
          :value="Number(chartStats.price)" 
          :formatter="(value) => `$${value.toFixed(2)}`"
        />
      </el-col>
      <el-col :span="8">
        <el-statistic 
          :title="$t(`label.Total Cost`)"
          :value="Number(chartStats.cost)" 
          :formatter="(value) => `$${value.toFixed(2)}`"
        />
      </el-col>
      <el-col :span="8">
        <el-statistic 
          :title="$t(`label.${chartType} Total Profit`)" 
          :class="{positive: chartStats.profit > 0, negative: chartStats.profit < 0}" 
          :value="Math.abs(Number(chartStats.profit))" 
          :formatter="(value) => `${chartStats.profit > 0 ? '+' : chartStats.profit < 0 ? '-' : ''}${value.toFixed(2)}`"
        />
      </el-col>
    </el-row>
    <!-- CHART STATS -->

    <div class="flex items-center justify-between">
      <label class="block text-xs mt-4 mb-3">{{$t(itemType === 'total_sold' ? 'label.Most Sold Items' : 'label.Most Profitable Items')}}</label>
      <el-segmented v-model="itemType" :options="itemOptions" />
    </div>
    <div>
      <el-table 
        ref="tableRef"
        class="w-full" 
        :data="Object.values(stats.inventory.stock).filter(item => item.total_sold > 0).slice((currentPage - 1) * pageSize, currentPage * pageSize)" 
        table-layout="auto" 
        row-class-name="table-row" 
        border
        :default-sort="{ prop: itemType, order: 'descending'}"
      >
        <el-table-column :prop="stats.inventory.name_column" :label="$t('label.Name')" />
        <el-table-column :prop="stats.inventory.quantity_column" :label="$t('label.Quantity')" />
        <el-table-column prop="total_sold" :label="$t('label.Sold')" />
        <el-table-column prop="total_profit" :label="$t('label.Profit')">
          <template #default="scope">
            <span :class="{ 'positive': scope.row.total_profit > 0, 'negative': scope.row.total_profit < 0 }">
              {{ scope.row.total_profit > 0 ? '+' : scope.row.total_profit < 0 ? '-' : '' }}{{ Math.abs(scope.row.total_profit).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="flex items-center justify-end mt-4">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="Object.values(stats.inventory.stock).filter(item => item.total_sold > 0).length"
          layout="prev, pager, next"
          :hide-on-single-page="true"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["unauth", "store-required", "language"],
});

//Imports
import moment from 'moment'
const { $t } = useNuxtApp();
const { handleGetRequest } = useHandleRequests();
const { calcStore, calcTransactions } = useCalculations();
const pinia = useStore();

//Data
const loading = ref(true);
const storeId = computed(pinia.getStore);
const stats = ref(null);
const chartType = ref("Week");
const itemType = ref("total_sold");
const currentPage = ref(1);
const pageSize = ref(10);
const tableRef = ref(null);

// Computed default sort based on itemType
const defaultSort = computed(() => ({
  prop: itemType.value,
  order: 'descending'
}));

//Chart
const series = ref([{ name: "Profit", data: [] }]);
const chartStats = reactive({ price: "0.00",cost: "0.00", profit: "0.00", transactions: 0, card: "0.00", cash: "0.00", check: "0.00" });
const options = [
  { label: $t("tabs.Week"), value: "Week" },
  { label: $t("tabs.Month"), value: "Month" },
  { label: $t("tabs.Year"), value: "Year" },
];
const itemOptions = [
  { label: $t("tabs.Most Sold"), value: "total_sold" },
  { label: $t("tabs.Most Profitable"), value: "total_profit" },
];

const chartOptions = ref({
  chart: {
    type: "line",
    width: "100%",
    height: 350,
  },
  xaxis: {
    type: "datetime",
    labels: {
      style: {
        colors: "#FFFFFF", // White color for x-axis labels
      },
      formatter: function (val, timestamp) {
        const date = moment(new Date(val));
        if (chartType.value === "Month" || chartType.value === "Year") {
          // Find the corresponding data point
          const dataPoint = series.value[0].data.find((item) => item.x === val);
          if (dataPoint) {
            const endDate = moment(new Date(dataPoint.end));
            return `${date.format("MMM DD")} - ${endDate.format("MMM DD")}`;
          }
        }
        // For week or year view
        return date.format(chartType.value === "Week" ? "MMM DD" : "MMM");
      },
    },
    title: {
      text: $t("label.Date"),
      style: {
        color: "#FFFFFF",
      },
    },
    axisBorder: {
      show: true,
      color: "#FFFFFF", // White color for the x-axis line
    },
    axisTicks: {
      show: true,
      color: "#FFFFFF", // White color for x-axis ticks
    },
  },
  yaxis: {
    title: {
      text: $t("label.Profit"),
      style: {
        color: "#FFFFFF",
      },
    },
    labels: {
      style: {
        colors: "#FFFFFF", // White color for y-axis labels
      },
    },
    axisBorder: {
      show: true,
      color: "#FFFFFF", // White color for the y-axis line
    },
    axisTicks: {
      show: true,
      color: "#FFFFFF", // White color for y-axis ticks
    },
  },
  tooltip: {
    theme: "dark",
    x: {
      formatter: function (val, timestamp) {
        const date = moment(new Date(val));
        if (chartType.value === "Month" || chartType.value === "Year") {
          // Find the corresponding data point
          const dataPoint = series.value[0].data.find((item) => item.x === val);
          if (dataPoint) {
            const endDate = moment(new Date(dataPoint.end));
            return `${date.format("MMM DD")} - ${endDate.format("MMM DD")}`;
          }
        }
        // For week or year view
        return date.format(chartType.value === "Week" ? "MMM DD" : "MMM");
      },
    },
  },
});

//Watch
watch(chartType, () => {
  updateChart();
});

watch(itemType, (newType) => {
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.sort(newType, 'descending');
    }
  });
});

onBeforeMount(async () => {
  await fetchStats();
  loading.value = false;
});

async function fetchStats() {
  stats.value = await handleGetRequest(`/api/protected/stats/${storeId.value}`);
  stats.value.transactions = calcTransactions(stats.value.transactions);
  stats.value.layaways = calcTransactions(stats.value.layaways);
  updateChart();

  //Test data
  console.log(JSON.stringify(stats.value));
}

//Update chart
async function updateChart() {
  if (!stats.value) return;

  const { chart_data, total_cost, total_price, total_profit, total_transactions, total_card, total_cash, total_check } = calcStore(
    stats.value.transactions,
    stats.value.layaways,
    stats.value.inventory.stock,
    chartType.value
  );
  series.value[0].data = chart_data;
  chartStats.price = total_price;
  chartStats.cost = total_cost;
  chartStats.profit = total_profit;
  chartStats.transactions = total_transactions;
  chartStats.card = total_card;
  chartStats.cash = total_cash;
  chartStats.check = total_check;

  // Re-apply current sort
  nextTick(() => {
    if (tableRef.value) {
      tableRef.value.sort(itemType.value, 'descending');
    }
  });
}
</script>

<style lang="scss" scoped>
.positive {
  color: #96ff63;
  :deep(.el-statistic__number) {
    color: #96ff63;
  }
}

.negative {
  color: #ec6262;
  :deep(.el-statistic__number) {
    color: #ec6262;
  }
}
</style>