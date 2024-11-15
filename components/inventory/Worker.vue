<template>
  <div>
    <div id="wrapper">
      <div v-if="!loading.startedLoading" id="container">

        <div v-if="!inventory.length">
          {{$t('please wait until inventory set by your employer')}}
        </div>

        <div v-else style="height: calc(100vh - 215px); width: calc(100vw - 140px); padding-top: 32px;">
          <!-- TABLE ACTIONS -->
          <InventoryAddRow ref="addRowRef" v-if="permissions.add_item" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryEditRow ref="editRowRef" v-if="permissions.edit_item" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <InventoryDeleteRow ref="deleteRowRef" v-if="permissions.delete_item" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          <OperationsReceiving ref="receivingRowRef" v-if="permissions.receiving" :storeId="storeId" :inventory="store.inventory" @setInventory="setInventory" />
          
          <div class="flex items-center flex-wrap gap-2 bg-[#090909] py-2 px-6">
            <el-dropdown v-if="permissions.add_item" placement="bottom-start" trigger="click">
              <span class="p-2 mr-4 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">
                {{$t(`label.menu`)}}
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                    <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                      <Icon class="text-green-500 mr-3 mt-[1px]" name="ic:baseline-plus" /> {{$t(`title.add item`)}}
                    </div>
                  </el-tooltip>

                  <el-dropdown-item v-else @click="handleRowClick('add')">
                    <Icon class="text-green-500 mr-3 mt-[1px]" name="ic:baseline-plus" /> {{$t(`title.add item`)}}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- SEARCH -->
            <div class="max-w-sm mx-auto w-full">
              <el-input v-model="form.search.query" size="large" :placeholder="$t(`label.search`)" clearable>
                <template #suffix>
                  <el-dropdown placement="bottom-end" trigger="click">
                    <span class="px-3 py-1 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">                    
                      <Icon class="text-lg" name="line-md:filter-filled" />
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <div class="text-base py-2 px-3"><label>{{$t(`title.search by`)}}</label></div>
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
          <el-table :data="filteredInventory" ref="tableRef" class="w-full h-full" table-layout="auto" :default-sort="{ prop: form.sort.col }" border>
            <el-table-column v-if="permissions.receiving || permissions.edit_item || permissions.delete_item" label="Operations" width="140">
              <template #header>
                <div class="flex items-center gap-1 w-full">
                  <div class="text-center w-full">{{$t(`label.operations`)}}</div>
                </div>
              </template>

              <template #default="scope">
                <div class="flex justify-center">
                  <div v-if="permissions.receiving">
                    <el-tooltip v-if="!store.inventory.name_column || !store.inventory.quantity_column || !store.inventory.cost_column" :content="$t(`tippy.name, quantity, cost column must be registered before receiving`)" placement="top">
                      <el-button disabled link>
                        <div class="p-2"><Icon name="gravity-ui:boxes-3" /></div>
                      </el-button>
                    </el-tooltip>
                    <el-button v-else link @click="handleRowClick('receiving', scope.row)">
                      <div class="p-2"><Icon name="gravity-ui:boxes-3" /></div>
                    </el-button>
                  </div>
                  
                  <div v-if="permissions.edit_item">
                    <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                      <el-button class="!ml-0" disabled link>
                        <div class="p-2"><Icon name="material-symbols:edit-square-outline-rounded" /></div>
                      </el-button>
                    </el-tooltip>
                    <el-button v-else class="!ml-0" link @click="handleRowClick('edit', scope.row)">
                      <div class="p-2"><Icon name="material-symbols:edit-square-outline-rounded" /></div>
                    </el-button>
                  </div>

                  <div v-if="permissions.delete_item">
                    <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                      <el-button class="!ml-0" disabled link type="danger">
                        <div class="p-2"><Icon name="material-symbols:delete-rounded" /></div>
                      </el-button>
                    </el-tooltip>
                    <el-button v-else class="!ml-0" link type="danger" @click="handleRowClick('delete', scope.row)">
                      <div class="p-2"><Icon name="material-symbols:delete-rounded" /></div>
                    </el-button>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column v-for="column in store.inventory.columns" :key="column" :prop="column" :label="column" sortable />
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
const pinia = useStore()
const offlineStore = useOfflineStore()
const { isBoss, getPermissions } = useChecks()

//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const permissions = ref(null)
const store = ref({})
const inventory = ref([])
const loading = reactive({startedLoading: true})
const form = reactive({
  search: {query: '', checked: pinia.getFilteredColumns()}
})

//Element Reference
const tableRef = ref(null)
const addRowRef = ref(null)
const editRowRef = ref(null)
const deleteRowRef = ref(null)
const receivingRowRef = ref(null)

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
  
  permissions.value = await getPermissions()

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

//Sets a inventory value for components to set
function setInventory(data) {
  store.value.inventory = data
  inventory.value = formatInventory()
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
  } else if(type === 'receiving') {
    receivingRowRef.value.openPopup(row)
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
  store.value = await useFetchApi(`/api/protected/store/${storeId.value}`)
  
  if(store.value.inventory)
    inventory.value = formatInventory()

  const filtered = pinia.getFilteredColumns()
  if(!filtered.length && store.value.inventory?.columns.length)
    resetFilteredColumns(store.value.inventory.columns)
  
  //Test data
  // console.log(JSON.stringify(store.value))
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

.table-template {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>