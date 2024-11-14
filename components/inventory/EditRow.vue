<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.edit item`)">
      <el-form :model="form.editRow" label-position="top" @submit.prevent="editRow()">
        <el-form-item v-for="column in props.inventory.columns" :key="column" :label="column">
          <el-input v-model="form.model[column]" :value="form.model[column]" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button disabled type="warning">{{$t(`label.edit`)}}</el-button>
          </el-tooltip>
          <el-button v-else type="warning" @click="editRow()" :loading="loading.editRow">{{$t(`label.edit`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { sendFrontendNotification } = useHelpers()
const { handleInventoryRequest } = useHandleRequests()
const { formatNameColumn, formatPriceColumn, formatQuantityColumn, formatDiscountColumn, formatCostColumn, validateValues } = useFormatter()
const offlineStore = useOfflineStore()

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
  },
  inventory: {
    type: Object,
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
    sendFrontendNotification('No changes were provided', 'warning')
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