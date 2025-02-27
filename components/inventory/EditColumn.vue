<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.edit columns`)">
      <el-form :model="form.value" label-position="top" @submit.prevent="editColumn()">
        <el-form-item v-for="(column, index) in props.inventory.columns" :key="column" :label="`${$t('label.column')} ${index+1}`">
          <el-input v-model="form.value[column]" :value="form.value[column]" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button disabled type="warning">{{$t(`label.edit`)}}</el-button>
          </el-tooltip>
          <el-button v-else type="warning" @click="editColumn()" :loading="loading.editColumn">{{$t(`label.edit`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { sendFrontendNotification } = useHelpers()
const { handleInventoryRequest } = useHandleRequests()
const pinia = useStore()
const offlineStore = useOfflineStore()

const loading = reactive({ editColumn: false })
const popup = ref(false)
const form = reactive({value: {}})

//Component Emits,Props
const emits = defineEmits(['setInventory', 'resetFilteredColumns'])
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
  form.value = props.inventory.columns.reduce((acc, current) => {Object.assign(acc, { [current]: current }); return acc}, {})
}

//Checks
function areValuesUnique(obj) {
  const values = Object.values(obj)
  const uniqueValues = new Set(values)
  return uniqueValues.size === values.length
}

//Request
async function editColumn() {
  //Setup data
  let {name_column, price_column, quantity_column, discount_column, cost_column} = props.inventory
  let filters = pinia.getFilteredColumns()
  const map = Object.fromEntries(Object.entries(form.value).filter(([key, value]) => {
    const trimmedValue = value.trim()
    return key !== trimmedValue && trimmedValue !== ''
  }).map(([key, value]) => [key, value.trim()]))

  //Check if there is something to change
  if(Object.keys(map).length === 0) {
    sendFrontendNotification('No changes were provided', 'warning')
    return
  }
  //Check if all columns are unique
  if(!areValuesUnique(form.value)) {
    sendFrontendNotification('All column names must be unique', 'warning')
    return
  }

  //Update static columns
  for (const [oldKey, newKey] of Object.entries(map)) {
    if (oldKey === name_column) {
      name_column = newKey
    } else if (oldKey === price_column) {
      price_column = newKey
    } else if (oldKey === quantity_column) {
      quantity_column = newKey
    } else if (oldKey === discount_column) {
      discount_column = newKey
    } else if (oldKey === cost_column) {
      cost_column = newKey
    }

    filters = filters.map(str => str === oldKey ? newKey : str)
  }

  //Make inventory request
  loading.editColumn = true
  let inventory = await handleInventoryRequest({
    path: 'edit-column',
    data: { store_id: props.storeId, column_map: map, name_column: name_column, price_column: price_column, quantity_column: quantity_column, discount_column: discount_column, cost_column: cost_column},
  })

  //Emit to parent component
  if(inventory) {
    emits('setInventory', inventory)
    emits('resetFilteredColumns', filters)
  }
  
  //Loading complete, Close popup
  loading.editColumn = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>