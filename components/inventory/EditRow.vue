<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Edit Item" fullscreen>
      <el-form :model="form.editRow" label-position="top" @submit.prevent="editRow()">
        <el-form-item v-for="column in props.inventory.columns" :key="column" :label="column">
          <el-input v-model="form.model[column]" :value="form.model[column]" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-button type="warning" @click="editRow()" :loading="loading.editRow">Edit</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
const { formatNameColumn, formatPriceColumn, formatQuantityColumn, formatDiscountColumn, formatCostColumn, validateValues } = useFormatter()
const { notify } = useNotification()

const loading = reactive({ editRow: false })
const popup = ref(false)
const form = reactive({
  key: 0,
  model: {}
})

//Component Emits,Props
const emits = defineEmits(['setInventory'])
const props = defineProps({
  storeId: {
    type: Number,
    required: true
  },
  inventory: {
    type: Object,
    required: true
  }
})

//Prompt
function openPopup(row) {
  popup.value = true
  form.key = row.__id
  form.model = Object.assign({}, row)
  delete form.model.__id
}

//Request
async function editRow() {
  //Setup data
  let row = form.model
  let key = form.key
  let {name_column, price_column, quantity_column, discount_column, cost_column, stock} = props.inventory

  //Check if any changes were made
  const changedKeys = []
  for (let column in stock[key]) {
    if (stock[key][column] !== row[column])
      changedKeys.push(column)
  }
  //If no changes were found exit function
  if(!changedKeys.length) {
    notify({ title: 'Warning', text: 'No changes were made.', type: 'warn'})
    return
  }

  //Make values valid
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
  loading.editRow = true
  let inventory = await handleInventoryRequest({
    path: 'edit-row',
    data: { store_id: props.storeId, key: key, item: row, prev_item: stock[key] },
  })

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.editRow = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>