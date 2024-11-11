<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.add item`)">
      <el-form :model="form.value" label-position="top" @submit.prevent="addRow()">
        <el-form-item v-for="column in props.inventory.columns" :key="column" :label="column">
          <el-input v-model="form.value[column]" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-button type="success" @click="addRow()" :loading="loading.addRow">{{$t(`label.add`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
const { formatNameColumn, formatPriceColumn, formatQuantityColumn, formatDiscountColumn, formatCostColumn, validateValues } = useFormatter()

const loading = reactive({ addRow: false })
const popup = ref(false)
const form = reactive({value: {}})

//Component Emits,Props
const emits = defineEmits(['setInventory'])
const props = defineProps({
  storeId: {
    type: Number,
  },
  inventory: {
    type: Object,
  }
})

//Prompt
function openPopup() {
  popup.value = true
  form.value = props.inventory.columns.reduce((acc, current) => {Object.assign(acc, { [current]: "" }); return acc}, {})
}

//Request
async function addRow() {
  //Setup data
  let row = form.value
  let {name_column, price_column, quantity_column, discount_column, cost_column} = props.inventory
  Object.keys(row).forEach((key) => {
    if(name_column === key) {
      row[key] = formatNameColumn(row[key])
    } else if(price_column === key) {
      row[key] = formatPriceColumn(row[key])
    } else if(quantity_column === key) {
      row[key] = formatQuantityColumn(row[key])
    } else if(discount_column === key) {
      row[key] = formatDiscountColumn(row[key])
    } else if(cost_column === key) {
      row[key] = formatCostColumn(row[key])
    } else {
      row[key] = validateValues(row[key])
    }
  })

  //Make inventory request
  loading.addRow = true
  let inventory = await handleInventoryRequest({
    path: 'add-row',
    data: { store_id: props.storeId, item: row },
  })

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.addRow = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>