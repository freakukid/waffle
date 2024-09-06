<template>
  <div>
    <!-- Create -->
    <el-dialog v-model="popup.createStore" title="Create Store" width="300" @opened="focusCreateInput">
      <p style="color: red;">Warning: You will be logout and must sign in to refresh local data. This is necessary to make this application much faster & safe.</p>
      <el-form :model="form" @submit.prevent="createStore()" :rules="rules">
        <el-form-item label="Store name" prop="name">
          <el-input v-model="form.name" ref="createRef" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup.createStore = false">Cancel</el-button>
          <el-button type="success" @click="createStore()" :disabled="form.name.length < 2" :loading="loading.createStore">Create</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Create -->

    <!-- Edit -->
    <el-dialog v-model="popup.editStore" title="Edit Store" width="300" @opened="focusEditInput">
      <el-form :model="form" @submit.prevent="editStore()" :rules="rules">
        <el-form-item label="Store name" prop="name">
          <el-input v-model="form.editName" ref="editRef" autocomplete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup.editStore = false">Cancel</el-button>
          <el-button type="warning" @click="editStore()" :disabled="form.editName.length < 2" :loading="loading.editStore">Edit</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Edit -->

    <!-- Delete -->
    <el-dialog v-model="popup.deleteStore" title="Delete Store" width="300">
      <p style="text-align: center;">
        Are you sure you want to delete <br /><br /> <b style="font-size: 20px">{{form.deleteName}}</b> <br/><br/>
        This cannot be undone and all worker accounts will be <b style="color: red;">deleted</b>.
      </p>
      <p>
        
      </p>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup.deleteStore = false">Cancel</el-button>
          <el-button type="danger" @click="deleteStore()" :loading="loading.deleteStore">Delete</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Delete -->

    <h1>Stores</h1>

    <div id="store-wrapper">
      <!-- STORES -->
      <el-card v-for="store in stores" :key="store.id" class="store" body-style="height: calc(100% - 105px);">
        <template #header>
          <div class="card-header">
            <h2><Icon name="emojione:convenience-store" />  {{store.name}}</h2>
          </div>
        </template>
        <div class="content">
          <p>Number of Workers: {{store.workers.length}}</p>
          <div>
            <label>Actions:</label>
            <div>
              <el-button type="warning" plain @click="popup.editStore = true, form.editName = '', form.editId = store.id">
                Edit
              </el-button>

              <el-button v-if="stores.length > 1" type="danger" plain @click="popup.deleteStore = true, form.deleteName = store.name, form.deleteId = store.id">
                Delete
              </el-button>
            </div>
          </div>
          <nuxt-link v-if="store.id != storeId" to="/boss/inventory" @click="setStore(store.id, store.name)">
            <el-button class="portal-btn" type="success">
              Enter Store
            </el-button>
          </nuxt-link>

          <el-button v-else class="portal-btn" type="danger" @click="exitStore()">
            Exit Store
          </el-button>
        </div>
      </el-card>
      <!-- STORES -->
      <el-button v-if="!loading.startedLoading" id="create-btn" type="primary" @click="popup.createStore = true, form.name = ''">
        <div class="btn-body">
          <Icon name="mdi:store-plus" />
          <b>Create Store</b>
        </div>
      </el-button>
    </div>
  </div>
</template>

<script setup>
//Import
import { ref } from '#imports'
const { signOut } = useAuth()
const { notify } = useNotification()
const pinia = useStore()

//General
const loading = reactive({ startedLoading: true, createStore: false, editStore: false, deleteStore: false })
const popup = reactive({ createStore: false, editStore: false, deleteStore: false })
const stores = ref([])
const storeId = computed(pinia.getStore)

//Create Input
const createRef = ref()
const focusCreateInput = () => {
  createRef.value?.focus()
}

//Edit Input
const editRef = ref()
const focusEditInput = () => {
  editRef.value?.focus()
}

//Component Props
const props = defineProps({
  user: {
    type: Object,
    required: true
  },
})

//Form
const form = reactive({
  name: '',
  editId: 0,
  editName: '',
  deleteName: '',
  deleteId: 0
})

//Form Rules
const rules = ref({
  name: [{ min: 2, message: 'Length should be 2 or more', trigger: 'blur' }],
})

//Mount
onBeforeMount(async () => {
  await updateStores()
  loading.startedLoading = false
})
//Mount

//Methods
function setStore(id, name) {
  pinia.setStore(id)
  notify({ title: 'Success', text: 'Enter store: ' + name, type: 'success'})
}

function exitStore() {
  pinia.exitStore()
  notify({ title: 'Success', text: 'You exited a store', type: 'success'})
}

async function updateStores() {
  //Make request
  stores.value = await useFetchApi(`/api/protected/store/stores`)
  //Test data
  // console.log(JSON.stringify(stores.value))
}

async function createStore() {
  if(form.name.length < 2) {
    return
  }

  loading.createStore = true
  
  const response = await useFetchApi(`/api/protected/store/create`, {
    method: "POST",
    body: {
      store_name: form.name,
    }
  })

  loading.createStore = false

  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  popup.createStore = false
  notify({ title: 'Success', text: response.message, type: 'success'})

  stores.value.push(response.store)

  //Sign out user to reset data
  signOut({ callbackUrl: '/login' })
  pinia.exitStore()
}

async function editStore() {
  if(form.editName.length < 2) {
    return
  }

  loading.editStore = true

  const response = await useFetchApi(`/api/protected/store/edit`, {
    method: "POST",
    body: {
      id: form.editId,
      store_name: form.editName,
    }
  })

  loading.editStore = false
  
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  popup.editStore = false
  notify({ title: 'Success', text: response.message, type: 'success'})

  const index = stores.value.findIndex(item => item.id === response.store.id)
  if (index !== -1)
    stores.value[index] = response.store
}

async function deleteStore() {
  loading.deleteStore = true

  const response = await useFetchApi(`/api/protected/store/delete`, {
    method: "POST",
    body: {
      id: form.deleteId,
    }
  })

  loading.deleteStore = false

  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  popup.deleteStore = false
  notify({ title: 'Success', text: response.message, type: 'success'})
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