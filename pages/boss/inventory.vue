<template>
  <div>
    <div id="wrapper" :class="{'edit-mode': toggle.edit, 'delete-mode': toggle.delete}">
      <div v-if="!loading.startedLoading" id="container">
        <div v-if="!inventory.length">
          <!-- IMPORT -->
          <InventoryImport :storeId="storeId" @setInventory="setInventory" @resetFilteredColumns="resetFilteredColumns" />
          <!-- IMPORT -->
        </div>
        <div v-else style="height: calc(100vh - 215px);width: calc(100vw - 140px); padding-top: 32px;">
          <!-- SEARCH -->
          <div id="search">
            <el-input v-model="form.search.query" size="large" placeholder="Type to search" clearable />

            <el-checkbox-group v-model="form.search.checked" :min="1" @change="pinia.setFilteredColumns(form.search.checked)">
              <el-checkbox v-for="column in store.inventory.columns" :key="column" :label="column" :value="column">{{ column }}</el-checkbox>
            </el-checkbox-group>
          </div>
          <!-- SEARCH -->

          <!-- TABLE ACTIONS -->
          <InventoryEditRow ref="editRowRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryDeleteRow ref="deleteRowRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryDeleteColumn ref="deleteColRef" :storeId="storeId" :inventory="store.inventory" :inventoryList="inventory" @setInventory="setInventory" @resetFilteredColumns="resetFilteredColumns" />
          <div id="toolbar">
            <InventoryAddRow :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
            <el-button @click="toggleEditMode()" type="warning">Edit Mode</el-button>
            <el-button @click="toggleDeleteMode()" type="danger" style="margin-left: 0">Delete Mode</el-button>
            <InventoryAddColumn :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
            <InventoryEditColumn :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" @resetFilteredColumns="resetFilteredColumns" />
            <InventorySortColumn :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
            <InventoryDropTable :storeId="storeId" @setInventory="setInventory" />
            <OperationsRecieving :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
            <InventoryExport :inventory="store.inventory" />
          </div>
          <!-- TABLE ACTIONS -->

          <!-- TABLE -->
          <el-table 
          v-if="inventory.length"
          :data="filteredInventory" 
          style="width: 100%; height: 100%;" 
          table-layout="auto" 
          row-class-name="table-row"
          :default-sort="{ prop: store?.inventory?.columns[0], order: 'ascending' }"
          @row-click="handleRowClick"
          @header-click="handleColumnClick">
            <el-table-column v-for="column in store.inventory.columns" :key="column" :prop="column" :label="column" :sortable="!toggle.delete" />
          </el-table>
          <!-- TABLE -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
//Imports
import { Loading as LoadingIcon } from '@element-plus/icons-vue'
const { notify } = useNotification()
const { isBoss } = useChecks()
const pinia = useStore()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const store = ref({})
const inventory = ref([])
const loading = reactive({startedLoading: true})
const toggle = reactive({edit: false, delete: false})
const form = reactive({
  search: {query: '', checked: pinia.getFilteredColumns()}
})

//Element Reference
const editRowRef = ref(null)
const deleteRowRef = ref(null)
const deleteColRef = ref(null)

//Filters inventory depending on search query
const filteredInventory = computed(() => {
  if (!form.search.query) return inventory.value
  return inventory.value.filter((data) => {
    return form.search.checked.some((prop) => {
      if (data[prop] && data[prop].toString().toLowerCase().trim().includes(form.search.query.toLowerCase().trim()))
        return true
      return false
    })
  })
})

//Mount
onBeforeMount(async () => {
  if(!storeId.value) {
    await navigateTo('/dashboard')
    return
  }

  //Only boss accounts have access to this page
  if(!isBossAccount.value) {
    await navigateTo('/worker/inventory')
    return
  }
    
  await getStore()
  loading.startedLoading = false
})
//Mount

//Sets a inventory value for components to set
function setInventory(data) {
  store.value.inventory = data
  inventory.value = formatInventory()
}

//Handles Column Clicks for Delete Mode
function handleColumnClick(col) { 
  //Accesses child's method through ref
  if(toggle.delete) {
    deleteColRef.value.openPopup(col)
  }
}

//Handles Row Clicks for Edit/Delete Mode
function handleRowClick(row) {
  //Accesses child's method through ref
  if(toggle.edit && editRowRef.value) {
    editRowRef.value.openPopup(row)
  } else if(toggle.delete) {
    deleteRowRef.value.openPopup(row)
  }
}

//Toggles rows to be selected for editting
function toggleEditMode() {
  toggle.edit = !toggle.edit
  toggle.delete = false
  notify({ title: 'Success', text: 'Edit mode: ' + (toggle.edit ? 'ON' : 'OFF'), type: 'success'})
}

//Toggles columns and rows to be selected for deletion
function toggleDeleteMode() {
  toggle.delete = !toggle.delete
  toggle.edit = false
  notify({ title: 'Success', text: 'Delete mode: ' + (toggle.delete ? 'ON' : 'OFF'), type: 'success'})
}

//Formats dictionary inventory into an array of dictionaries
function formatInventory() {
  return Object.entries(store.value.inventory.stock).map(([key, item]) => ({
    ...item,
    __id: key
  }))
}

//Sets search filtered columns stored in pinia
function resetFilteredColumns(columns) {
  pinia.setFilteredColumns(columns)
  form.search.checked = pinia.getFilteredColumns()
}

//Gets the store the user is in
async function getStore() {
  //Make Request
  store.value = await useFetchApi(`/api/protected/store/${storeId.value}`)
  
  //If we have inventory format add id (index) to data
  if(store.value.inventory)
    inventory.value = formatInventory()

  //Get store value filtering
  const filtered = pinia.getFilteredColumns()
  if(!filtered.length && store.value.inventory?.columns.length)
    resetFilteredColumns(store.value.inventory.columns)
  
  //Test Data
  // console.log(JSON.stringify(store.value))
}
</script>

<style lang="scss">
#wrapper {
  &.edit-mode  {
    .table-row {
      cursor: pointer;
      &:hover > td.el-table__cell {
        background: #ffff0026 !important;
      }
    }
    
    div {
      user-select: none;
    }
  }

  &.delete-mode  {
    .table-row {
      cursor: pointer;
      &:hover > td.el-table__cell {
        background: #ff000040 !important;
      }
    }
    thead {
      th {
        cursor: pointer;
        &:hover {
          background: #ff000040 !important;
        }
      }
    }
    div {
      user-select: none;
    }
  }
  .cell {
    display: flex;
    align-items: center;
    white-space: nowrap;
  }
}
</style>

<style lang="scss" scoped>
#wrapper {
  width: 100vw;
  height: calc(100vh - 40px);
  &.edit-mode .table-row {
    cursor: pointer;
    &:hover {
      background: #ffff0026 !important;
    }
  }
}

#container {
  height: 100%;
  padding-left: 100px;
}

#toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #090909;
  padding: 16px;
}

.table-template {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>