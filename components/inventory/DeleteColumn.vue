<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`title.delete column`)">
      <p style="text-align: center; color: #ff4545; font-size: 24px;">
        <b>{{$t(`text.this will delete the following data:`)}}</b>
      </p>

      <el-table :data="props.inventoryList" style="width: 100%; height: 100%;" table-layout="auto">
        <el-table-column :prop="form.name" :label="form.name" />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>

          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button disabled type="danger">{{$t(`label.delete`)}}</el-button>
          </el-tooltip>
          <el-button v-else type="danger" @click="deleteColumn()" :loading="loading.deleteColumn">{{$t(`label.delete`)}}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
const { handleInventoryRequest } = useHandleRequests()
const pinia = useStore()
const offlineStore = useOfflineStore()

const loading = reactive({ deleteColumn: false })
const popup = ref(false)
const form = reactive({
  name: ''
})

//Component Emits, Props
const emits = defineEmits(['setInventory', 'resetFilteredColumns'])
const props = defineProps({
  storeId: {
    type: Number,
  },
  inventory: {
    type: Object,
  },
  inventoryList: {
    type: Array,
  }
})

//Prompt
function openPopup(col) {
  popup.value = true
  form.name = col
}

//Request
async function deleteColumn() {
  //Setup Data
  let columnName = form.name
  let {name_column, price_column, quantity_column, discount_column, cost_column} = props.inventory
  name_column = name_column === columnName ? '' : name_column
  price_column = price_column === columnName ? '' : price_column
  quantity_column = quantity_column === columnName ? '' : quantity_column
  discount_column = discount_column === columnName ? '' : discount_column
  cost_column = cost_column === columnName ? '' : cost_column 

  //Make inventory request
  loading.deleteColumn = true
  let inventory = await handleInventoryRequest({
    path: 'delete-column',
    data: { store_id: props.storeId, column_name: columnName, name_column: name_column, price_column: price_column, quantity_column: quantity_column, discount_column: discount_column, cost_column: cost_column },
  })

  //Emit to parent component
  if(inventory) {
    emits('setInventory', inventory)
    emits('resetFilteredColumns', pinia.getFilteredColumns().filter(item => item !== columnName))
  }
  
  //Loading complete, Close popup
  loading.deleteColumn = false
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>