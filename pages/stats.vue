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
      <el-col :span="8">
        <el-statistic :title="$t(`label.${chartType} Total Sales`)" :value="`$${chartStats.price}`" />
      </el-col>
      <el-col :span="8">
        <el-statistic :title="$t(`label.${chartType} Total Profit`)" :class="{positive: chartStats.profit > 0, negative: chartStats.profit < 0}" :value="`${chartStats.profit > 0 ? '+' : chartStats.profit < 0 ? '-' : ''}${chartStats.profit}`" />
      </el-col>
    </el-row>
    <!-- CHART STATS -->
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
const { handleTransactionCalcs } = useHelpers();
const { calcStore } = useCalculations();
const pinia = useStore();

//Data
const loading = ref(true);
const storeId = computed(pinia.getStore);
const stats = ref(null);
const chartType = ref("Week");

//Chart
const series = ref([{ name: "Profit", data: [] }]);
const chartStats = reactive({ price: "0.00", profit: "0.00" });
const options = [
  { label: $t("tabs.Week"), value: "Week" },
  { label: $t("tabs.Month"), value: "Month" },
  { label: $t("tabs.Year"), value: "Year" },
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

onBeforeMount(async () => {
  await fetchStats();
  loading.value = false;
});

async function fetchStats() {
  stats.value = await handleGetRequest(`/api/protected/stats/${storeId.value}`);
  stats.value.transactions = handleTransactionCalcs(stats.value.transactions);
  stats.value.layaways = handleTransactionCalcs(stats.value.layaways);
  updateChart();

  //Test data
  // console.log(JSON.stringify(stats.value));
}

//Update chart
function updateChart() {
  const { chart_data, total_price, total_profit } = calcStore(
    stats.value.transactions,
    stats.value.layaways,
    chartType.value
  );
  series.value[0].data = chart_data;
  chartStats.price = total_price;
  chartStats.profit = total_profit;

  // Test data
  // console.log(JSON.stringify(series.value[0].data));
}
</script>

<style lang="scss" scoped>
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