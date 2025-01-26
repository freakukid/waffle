<template>
    <div class="w-full">
      <client-only placeholder="Loading chart..">
        <VueApexCharts type="line" :options="chartOptions" :series="series" />
      </client-only>
    </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth']
})

const isReady = ref(false)

const chartOptions = ref({
  chart: {
    id: 'simple-line-chart',
    toolbar: {
      show: false // Hide the toolbar for simplicity
    }
  },
  xaxis: {
    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
  },
  stroke: {
    curve: 'smooth'
  },
  title: {
    text: 'Simple Line Chart',
    align: 'left'
  }
})

const series = ref([
  {
    name: "Series 1",
    data: [30, 40, 45, 50, 49, 60, 70, 91]
  }
])
</script>

<style lang="scss">

</style>