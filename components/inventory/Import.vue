<template>
  <div>
    <!-- Import Input -->
    <input ref="fileInput" type="file" @change="excelFileToJson" />
    <!-- Import Input -->

    <!-- Import Btn -->
    <div class="mt-32">
      <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
        <el-button disabled type="primary">Import Inventory by Excel File</el-button>
      </el-tooltip>
      <el-button v-else @click="fileInput.click()" type="primary">Import Inventory by Excel File</el-button>
    </div>
    <!-- Import Btn -->
  </div>
</template>

<script setup>
import { Workbook } from 'exceljs'
const { validateValues } = useFormatter()
const { handleInventoryRequest } = useHandleRequests()
const offlineStore = useOfflineStore()

const fileInput = ref()
const loading = reactive({ import: false })

//Component Emits, Props
const emits = defineEmits(['setInventory', 'resetFilteredColumns'])
const props = defineProps({
  storeId: {
    type: Number,
  }
})

//Creates the column list for backend
function getColumnList(json) {
  if (Object.keys(json).length === 0) { // Return an empty array if the object is empty
    return []
  } else { // Get the first key from the object
    const firstKey = Object.keys(json)[0]
    return Object.keys(json[firstKey]) // Return the keys of the first object
  }
}

// Excel File to JSON
async function excelFileToJson(event) {
  const file = event.target.files[0]
  //Check if we are getting excel files only
  if (!/\.xlsx$|\.xls$/.test(file.name)) {
    alert('Please select an Excel file (.xlsx or .xls)')
    return
  }

  //Setup data
  const workbook = new Workbook()
  await workbook.xlsx.load(file)
  let jsonData = {}
  let uniqueKey = 0
  workbook.worksheets.forEach(function(sheet) {
    let firstRow = sheet.getRow(1)
    if (!firstRow.cellCount) return
    let keys = firstRow.values
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber == 1) return
      let values = row.values
      let obj = {}
      for (let i = 1; i < keys.length; i ++) {
        let value = values[i]        
        if(Object.prototype.toString.call(value) === '[object Object]' && value.hasOwnProperty('result'))
          obj[keys[i]] = validateValues(value.result)
        else
          obj[keys[i]] = validateValues(value)
      }
      jsonData[uniqueKey] = obj
      uniqueKey += 1
    })
  })
  const columns = getColumnList(jsonData)

  //Make inventory request
  loading.import = true
  let inventory = await handleInventoryRequest({
    path: 'import',
    data: { store_id: props.storeId, stock: jsonData, columns: columns, unique_key: uniqueKey },
  })

  //Emit to parent component
  if(inventory) {
    emits('setInventory', inventory)
    emits('resetFilteredColumns', columns)
  }

  //Loading complete
  loading.import = false
}
</script>

<style lang="scss" scoped>
input[type="file"] {
  display: none;
}
</style>