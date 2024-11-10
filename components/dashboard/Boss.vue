<template>
  <div>
    <!-- Delete -->
    <el-dialog v-model="popup.deleteStore" :title="$t(`title.delete store`)" width="300">
      <p style="text-align: center;">
        {{ $t('text.are you sure you want to delete', { name: form.deleteName }) }}<br/><br/>
      </p>
      <p>
        {{ $t("text.this cannot be undone and all worker accounts will be deleted") }}
      </p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup.deleteStore = false">{{ $t("label.cancel") }}</el-button>
          
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button type="danger" disabled>{{ $t("label.delete") }}</el-button>
          </el-tooltip>
          <el-button v-else type="danger" @click="deleteStore()" :loading="loading.deleteStore">{{ $t("label.delete") }}</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Delete -->

    <div v-if="stores.length" id="store-wrapper">
      <!-- STORES -->
      <el-card v-for="store in stores" :key="store.id" class="store" body-style="height: calc(100% - 105px);">
        <template #header>
          <div class="card-header">
            <h2><Icon name="emojione:convenience-store" />  {{store.name}}</h2>
          </div>
        </template>
        <div class="content">
          <p>{{ $t("label.number of workers") }}: {{store.workers.length}}</p>
          <div>
            <label>{{ $t("label.actions") }}:</label>
            <div>
              <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                <el-button type="warning" plain disabled>{{ $t("label.edit") }}</el-button>
              </el-tooltip>
              <el-button v-else type="warning" plain @click="openEditStore(store)">{{$t("label.edit")}}</el-button>

              <el-tooltip v-if="!offlineStore.getOnlineStatus() && stores.length > 1" :content="$t(`tippy.feature only available online`)" placement="top">
                <el-button type="danger" plain disabled>{{ $t("label.delete") }}</el-button>
              </el-tooltip>
              <el-button v-else-if="stores.length > 1" type="danger" plain @click="popup.deleteStore = true, form.deleteName = store.name, form.deleteId = store.id">
                {{ $t("label.delete" )}}
              </el-button>
            </div>
          </div>
          <nuxt-link v-if="store.id != storeId" to="/inventory" @click="setStore(store.id, store.name)">
            <el-button class="portal-btn" type="success">
              {{ $t("title.enter store" )}}
            </el-button>
          </nuxt-link>

          <el-button v-else class="portal-btn" type="danger" @click="exitStore()">
            {{ $t("title.exit store" )}}
          </el-button>
        </div>
      </el-card>
      <!-- STORES -->

      <StoreModifyStore type="create" @addStore="addStore" />
      <StoreModifyStore
        ref="editStoreRef"
        type="edit"
        :id="form.store?.id"
        :name="form.store?.name"
        :email="form.store?.email"
        :phone="form.store?.phone"
        :website="form.store?.website"
        :address="form.store?.address"
        :city="form.store?.city"
        :zipcode="form.store?.zipcode"
        :state="form.store?.state"
        :country="form.store?.country"
        @editStore="editStore"
      />
    </div>
  </div>
</template>

<script setup>
//Import
import { ref } from '#imports'
import { ElNotification } from 'element-plus'
const { fetch } = useUserSession()
const pinia = useStore()
const offlineStore = useOfflineStore()

//General
const loading = reactive({ startedLoading: true, deleteStore: false })
const popup = reactive({ deleteStore: false })
const stores = ref([])
const storeId = computed(pinia.getStore)

//Reference
const editStoreRef = ref(null)

//Component Props
const props = defineProps({
  user: {
    type: Object,
  },
})

//Form
const form = reactive({
  deleteName: '',
  deleteId: 0,
  store: {}
})

//Mount
onBeforeMount(async () => {
  await updateStores()
  loading.startedLoading = false
})
//Mount

//Methods
async function openEditStore(store) {
  form.store = store
  await nextTick()
  editStoreRef.value.openPopup(true)
}

function setStore(id, name) {
  pinia.setStore(id)
  ElNotification({ title: 'Success', message: 'Enter store: ' + name, type: 'success'})
}

function exitStore() {
  pinia.exitStore()
  ElNotification({ title: 'Success', message: 'You exited a store', type: 'success'})
}

async function updateStores() {
  //Make request
  stores.value = await useFetchApi(`/api/protected/store/stores`)
  //Test data
  // console.log(JSON.stringify(stores.value))
}

function addStore(store) {
  stores.value.push(store)
}

function editStore(store) {
  const index = stores.value.findIndex(item => item.id === store.id)
  if (index !== -1)
    stores.value[index] = store
}

async function deleteStore() {
  //Setup data
  const { deleteId } = form
  //If we are inside store then exit store
  if(deleteId === storeId.value)
    pinia.exitStore()

  //Make Request
  loading.deleteStore = true
  const response = await useFetchApi(`/api/protected/store/delete`, {
    method: "POST",
    body: {
      id: deleteId,
    }
  })
  await fetch()
  loading.deleteStore = false

  //Show error notification
  if (response.statusCode) {
    ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
    return
  }

  //Close popup, notify user
  popup.deleteStore = false
  ElNotification({ title: 'Success', message: response.message, type: 'success'})
  //Remove store from list
  stores.value = stores.value.filter(item => item.id !== response.store_id)
}
//Methods
</script>

<style lang="scss" scoped>
@import './assets/general.scss';

h1 {
  margin: 0 64px;
}

#store-wrapper {
  background: #1e1e1e;
  min-height: calc(100vh - 172px);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 32px;
  .store {
    background: #000000;
    border: #1c1c1c;
    color: #ffffff;
    width: 300px;
    height: 300px;
    max-height: 300px;
    max-width: 300px;
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    .portal-btn {
      width: 100%;
    }
    .content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
      height: 100%;
    }
  }
}

#create-btn {
  height: 300px;
  width: 300px;
  background: #1c1c1c;
  border: 2px dashed #67c23a;
  color: #67c23a;
  font-size: 32px;
  transition: all 200ms ease-in-out;
  &:hover {
    border-color: #54ff00;
    color: #54ff00;
  }
  .btn-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    svg {
      font-size: 150px;
    }
  }
}
</style>