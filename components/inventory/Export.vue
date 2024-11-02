<template>
  <div>
    <!-- Export Btn -->
    <!-- <el-button @click="outputExcelFile" type="primary">Export Inventory</el-button> -->
    <!-- Export Btn -->
  </div>
</template>

<script setup>
import { Workbook } from 'exceljs'

//Component Emits, Props
const props = defineProps({
  inventory: {
    type: Object,
  }
})

// JSON to Excel File
async function outputExcelFile() {
  //Setup Data
  const inventory = Object.entries(props.inventory.stock).map(([key, item]) => (item))
  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet('Inventory')
  const headers = props.inventory.columns
  worksheet.columns = headers.map(header => { return { header: header, width: 20 }})  
  worksheet.addRows(inventory.map(item => headers.map(header => item[header])))
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    cell.style = {
      font: { name: 'Calibri', bold: true },
      alignment: { horizontal: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor:{ argb:'F0F8FF' } }
    }
  })

  //Create link and download file
  const excelBlob = await workbook.xlsx.writeBuffer()
  const url = URL.createObjectURL(new Blob([excelBlob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'inventory.xlsx'
  a.click()
}

// Expose the openPopup method to parent
defineExpose({
  outputExcelFile
})
</script>