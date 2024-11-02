<template>
  <div id="inventory-page">
    <div id="wrapper">
      <div v-if="!loading.startedLoading" id="container">
        <div v-if="!inventory.length">
          <!-- IMPORT -->
          <InventoryImport :storeId="storeId" @setInventory="setInventory" @resetFilteredColumns="resetFilteredColumns" />
          <!-- IMPORT -->
        </div>
        <div v-else style="height: calc(100vh - 215px); width: calc(100vw - 140px); padding-top: 32px;">
          <!-- TABLE ACTIONS -->
          <OperationsRecieving ref="recievingRowRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryAddRow ref="addRowRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryEditRow ref="editRowRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryDeleteRow ref="deleteRowRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryAddColumn ref="addColRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryEditColumn ref="editColRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" @resetFilteredColumns="resetFilteredColumns" />
          <InventoryDeleteColumn ref="deleteColRef" :storeId="storeId" :inventory="store.inventory" :inventoryList="inventory" @setInventory="setInventory" @resetFilteredColumns="resetFilteredColumns" />
          <InventorySortColumn ref="sortColRef" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryExport ref="exportTableRef" :inventory="store.inventory" />
          <InventoryDropTable ref="dropTableRef" :storeId="storeId" @setInventory="setInventory" />

          <div id="toolbar">
            <el-dropdown placement="bottom-start" trigger="click">
              <span class="p-2 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">
                Menu
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                    <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                      <Icon class="text-green-500 mr-3 mt-[1px]" name="ic:baseline-plus" /> Add Item
                    </div>
                  </el-tooltip>

                  <el-dropdown-item v-else @click="handleRowClick('add')">
                    <Icon class="text-green-500 mr-3 mt-[1px]" name="ic:baseline-plus" /> Add Item
                  </el-dropdown-item>

                  <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                    <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                      <Icon class="text-green-500 mr-3 mt-[1px]" name="ic:baseline-plus" /> Add Column
                    </div>
                  </el-tooltip>

                  <el-dropdown-item divided v-else @click="handleColumnClick('add', column)">
                    <Icon class="text-green-500 mr-3 mt-[1px]" name="ic:baseline-plus" /> Add Column
                  </el-dropdown-item>

                  <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                    <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                      <Icon class="mr-3 mt-[1px]" name="material-symbols:edit-square-outline-rounded" /> Edit Columns
                    </div>
                  </el-tooltip>

                  <el-dropdown-item v-else @click="handleColumnClick('edit', column)">
                    <Icon class="mr-3 mt-[1px]" name="material-symbols:edit-square-outline-rounded" /> Edit Columns
                  </el-dropdown-item>

                  <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                    <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                      <Icon class="mr-3 mt-[1px]" name="solar:sort-horizontal-bold" /> Sort Columns
                    </div>
                  </el-tooltip>

                  <el-dropdown-item v-else @click="handleColumnClick('sort', column)">
                    <Icon class="mr-3 mt-[1px]" name="solar:sort-horizontal-bold" /> Sort Columns
                  </el-dropdown-item>

                  <el-dropdown-item divided @click="exportTableRef.outputExcelFile()">
                    <Icon class="mr-3 mt-[1px]" name="vscode-icons:file-type-excel" /> Export Table
                  </el-dropdown-item>

                  <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                    <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                      <Icon class="text-red-700 mr-3 mt-[1px]" name="mdi:database-remove-outline" /> Drop Table
                    </div>
                  </el-tooltip>
                  <el-dropdown-item v-else @click="dropTableRef.openPopup()">
                    <Icon class="text-red-700 mr-3 mt-[1px]" name="mdi:database-remove-outline" /> Drop Table
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- SEARCH -->
            <div class="max-w-sm mx-auto w-full">
              <el-input v-model="form.search.query" size="large" placeholder="Search" clearable>
                <template #suffix>
                  <el-dropdown placement="bottom-end" trigger="click">
                    <span class="px-3 py-1 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">                    
                      <Icon class="text-lg" name="line-md:filter-filled" />
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <div class="text-base py-2 px-3"><label>Search by</label></div>
                        <el-checkbox-group v-model="form.search.checked" class="flex flex-col" :min="1" @change="pinia.setFilteredColumns(form.search.checked)">
                          <el-checkbox v-for="column in store.inventory.columns" :key="column" class="!mx-0 px-4 !h-10" :label="column" :value="column">{{ column }}</el-checkbox>
                        </el-checkbox-group>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </template>
              </el-input>
            </div>
            <!-- SEARCH -->
          </div>
          <!-- TABLE ACTIONS -->

          <!-- TABLE -->
          <el-table v-if="inventory.length" ref="tableRef" class="w-full h-full" :data="filteredInventory" table-layout="auto" row-class-name="table-row" :default-sort="{ prop: store?.inventory?.columns[0], order: 'ascending' }" border>
            <el-table-column label="Operations" width="140">
              <template #header>
                <div class="flex items-center gap-1 w-full">
                  <div class="text-center w-full">Operations</div>
                </div>
              </template>

              <template #default="scope">
                <div class="flex justify-center">
                  <el-tooltip v-if="!store.inventory.name_column || !store.inventory.quantity_column || !store.inventory.cost_column" content="Name, Quantity, Cost Column must be registered before recieving." placement="top">
                    <el-button disabled link>
                      <div class="p-2"><Icon name="gravity-ui:boxes-3" /></div>
                    </el-button>
                  </el-tooltip>
                  <el-button v-else link @click="handleRowClick('recieving', scope.row)">
                    <div class="p-2"><Icon name="gravity-ui:boxes-3" /></div>
                  </el-button>

                  <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                    <el-button class="!ml-0" disabled link>
                      <div class="p-2"><Icon name="material-symbols:edit-square-outline-rounded" /></div>
                    </el-button>
                  </el-tooltip>
                  <el-button v-else class="!ml-0" link @click="handleRowClick('edit', scope.row)">
                    <div class="p-2"><Icon name="material-symbols:edit-square-outline-rounded" /></div>
                  </el-button>

                  <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                    <el-button class="!ml-0" disabled link type="danger">
                      <div class="p-2"><Icon name="material-symbols:delete-rounded" /></div>
                    </el-button>
                  </el-tooltip>
                  <el-button v-else class="!ml-0" link type="danger" @click="handleRowClick('delete', scope.row)">
                    <div class="p-2"><Icon name="material-symbols:delete-rounded" /></div>
                  </el-button>
                </div>
              </template>
            </el-table-column>

            <el-table-column v-for="column in store.inventory.columns" :key="column" :prop="column" :label="column">
              <template #header>
                <div class="flex items-center gap-1 w-full">
                  <div>{{column}}</div>

                  <el-dropdown trigger="click">
                    <span class="w-8 text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">
                      <Icon class="text-base" name="ic:baseline-keyboard-arrow-down" />
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item v-if="!(form.sort.col === column && form.sort.order === 'ascending')" @click="sortTable(column, 'ascending')"><Icon class="mr-3 mt-[1px]" name="tabler:arrow-big-up-filled" /> Sort Ascending</el-dropdown-item>
                        <el-dropdown-item v-if="!(form.sort.col === column && form.sort.order === 'descending')" @click="sortTable(column, 'descending')"><Icon class="mr-3 mt-[1px]" name="tabler:arrow-big-down-filled" /> Sort Descending</el-dropdown-item>
                        
                        <el-tooltip v-if="!offlineStore.getOnlineStatus()" content="Feature only available online." placement="top">
                          <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                            <Icon class="text-red-700 mr-3 mt-[1px]" name="lineicons:trash-can" /> Delete Column
                          </div>
                        </el-tooltip>

                        <el-dropdown-item v-else @click="handleColumnClick('delete', column)">
                          <Icon class="text-red-700 mr-3 mt-[1px]" name="lineicons:trash-can" /> Delete Column
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
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
const { $eventBus } = useNuxtApp()
import { ElNotification } from 'element-plus'
const { isBoss } = useChecks()
const { handleGetRequest } = useHandleRequests()
const pinia = useStore()
const offlineStore = useOfflineStore()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const store = ref({})
const inventory = ref([])
const loading = reactive({startedLoading: true})
const form = reactive({
  search: {query: '', checked: pinia.getFilteredColumns()},
  sort: { col: '', order: '' }
})

//Element Reference
const tableRef = ref(null)
const addRowRef = ref(null)
const editRowRef = ref(null)
const deleteRowRef = ref(null)
const addColRef = ref(null)
const editColRef = ref(null)
const deleteColRef = ref(null)
const sortColRef = ref(null)
const recievingRowRef = ref(null)
const exportTableRef = ref(null)
const dropTableRef = ref(null)

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

// Set up the event listener when the component mounts
onMounted(() => {
  $eventBus.on('setInventory', setInventory)
})

// Clean up the event listener when the component is unmounted
onBeforeUnmount(() => {
  $eventBus.off('setInventory', setInventory)
})
//Mount

function sortTable(col, order) {
  // Use the sorted column method from the table instance
  tableRef.value.sort(col, order)
  form.sort.col = col
  form.sort.order = order
}

//Sets a inventory value for components to set
function setInventory(data) {
  store.value.inventory = data
  inventory.value = formatInventory()
}

//Handles Column Clicks for Delete Mode
function handleColumnClick(type, col) {
  //Accesses child's method through ref
  if(type === 'sort') {
    sortColRef.value.openPopup()
  } else if(type === 'add') {
    addColRef.value.openPopup()
  } else if(type === 'edit') {
    editColRef.value.openPopup()
  } else if(type === 'delete') {
    deleteColRef.value.openPopup(col)
  }
}

//Handles Row Clicks for Edit/Delete Mode
function handleRowClick(type, row) {
  //Accesses child's method through ref
  if(type === 'add') {
    addRowRef.value.openPopup()
  } else if(type === 'edit') {
    editRowRef.value.openPopup(row)
  } else if(type === 'delete') {
    deleteRowRef.value.openPopup(row)
  } else if(type === 'recieving') {
    recievingRowRef.value.openPopup(row)
  }
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
  store.value = await handleGetRequest(`/api/protected/store/${storeId.value}`)
    
  //If we have inventory format add id (index) to data
  if(store.value.inventory)
    inventory.value = formatInventory()

  //Keep track of the current sort
  form.sort.col = store.value.inventory?.columns[0]
  form.sort.order = 'ascending'

  //Get store value filtering
  const filtered = pinia.getFilteredColumns()
  if(!filtered.length && store.value.inventory?.columns.length)
    resetFilteredColumns(store.value.inventory.columns)
  
  //Test Data
  // console.log(JSON.stringify(store.value))
  // console.log(JSON.stringify(inventory.value))
}
</script>

<style lang="scss">
.el-dropdown-menu__item:hover, .el-dropdown-menu__item:focus {
  background-color: #2b2b2b !important;
  color: #fff !important;
}
</style>

<style lang="scss" scoped>
#container {
  display: flex;
  justify-content: center;
  height: 100%;
}

#toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  background: #090909;
  padding: 8px 24px;
}

.table-template {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>