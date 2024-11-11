<template>
  <div v-if="!loading.startedLoading" id="worker-page">
    <div id="wrapper">
      <WorkerCreateWorker ref="createWorkerRef" @addUser="addUser" />

      <div id="tree-wrapper">
        <div class="flex items-center flex-wrap gap-2 bg-[#090909] py-2 px-6 mb-4 rounded-t-[6px]">
          <el-dropdown placement="bottom-start" trigger="click">
            <span class="p-2 mr-4 cursor-pointer text-center rounded-md hover:bg-zinc-800 hover:text-white transition-all leading-5">
              {{$t(`label.menu`)}}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                  <div class="flex items-center text-sm py-2 px-4 cursor-default opacity-50">
                    <Icon class="text-green-500 mr-3 mt-[1px]" name="material-symbols:person-add-rounded" /> {{$t(`label.create worker`)}}
                  </div>
                </el-tooltip>

                <el-dropdown-item v-else @click="createWorkerRef.openPopup()">
                  <Icon class="text-green-500 mr-3 mt-[1px]" name="material-symbols:person-add-rounded" /> {{$t(`label.create worker`)}}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <el-tree
          v-if="!loading.startedLoading"
          :data="tree"
          :default-expanded-keys="expanded"
          :default-checked-keys="checked"
          :show-checkbox="offlineStore.getOnlineStatus()"
          node-key="id"
          @check-change="handleCheckChange"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <span>{{ data.is_worker ? node.label : $t(`label.${node.label}`) }}</span>

              <span v-if="!data.permission">
                <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                  <el-button type="warning" size="small" plain disabled>{{$t(`label.edit`)}}</el-button>
                </el-tooltip>
                <el-button v-else type="warning" size="small" plain @click="editPrompt($event, data)">{{$t(`label.edit`)}}</el-button>
                <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
                  <el-button type="danger" size="small" plain disabled>{{$t(`label.delete`)}}</el-button>
                </el-tooltip>
                <el-button v-else type="danger" size="small" plain @click="deletePrompt($event, data)">{{$t(`label.delete`)}}</el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- Popup -->
    <el-dialog v-model="popup.deleteUser" :title="$t(`label.delete user`)">
      <p style="text-align: center; color: #ff4545; font-size: 24px;">
        <b>{{$t(`text.delete`, {name: form.delete?.user?.user?.name})}}</b>
      </p>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup.deleteUser = false">{{$t(`label.cancel`)}}</el-button>
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button type="danger" disabled>{{$t(`label.delete`)}}</el-button>
          </el-tooltip>
          <el-button v-else type="danger" @click="deleteUser()" :loading="loading.deleteUser">{{$t(`label.delete`)}}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="popup.editUser" :title="$t(`label.edit user`)">
      <el-form :model="form.edit.model" label-position="top" @submit.prevent="editUser()">
        <el-form-item :label="$t('label.username')" prop="username"
        :rules="[
          {required: true, message: $t('invalid.Username is required'), trigger: 'blur'},
          { min: 3, max: 15, message: $t('invalid.Username must be between 3 and 15 characters'), trigger: 'blur' },
          { validator: validateUsername, trigger: 'change' }]"
        >
          <el-input v-model="form.edit.model.username" :value="form.edit.model.username" autocomplete="off" />
        </el-form-item>
        <el-form-item :label="$t('label.name')" prop="name" :rules="[{ required: true, message: $t('invalid.Name is required'), trigger: 'blur' }]">
          <el-input v-model="form.edit.model.name" :value="form.edit.model.name" autocomplete="off" />
        </el-form-item>
        <el-form-item :label="`${$t('label.email')} (${$t('label.optional')})`" prop="email" :rules="[{ validator: validateOptionalEmail, trigger: 'blur' }]">
          <el-input v-model="form.edit.model.email" :value="form.edit.model.email" autocomplete="off" />
        </el-form-item>
        <el-form-item :label="`${$t('label.password')} (${$t('label.optional')})`">
          <el-input v-model="form.edit.model.password" :value="form.edit.model.password" type="password" placeholder="******" autocomplete="off" />
        </el-form-item>

        <div class="dialog-footer">
          <el-button @click="popup.editUser = false">{{$t(`label.cancel`)}}</el-button>
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button type="warning" disabled>{{$t(`label.edit`)}}</el-button>
          </el-tooltip>
          <el-button v-else type="warning" @click="editUser()" :loading="loading.editUser" native-type="submit">{{$t(`label.edit`)}}</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['unauth', 'store-required', 'language']
})

//Imports
import { ElNotification } from 'element-plus'
const { validateUsername, validateOptionalEmail } = useValidator()
const { isBoss } = useChecks()
const { handleGetRequest } = useHandleRequests()
const pinia = useStore()
const offlineStore = useOfflineStore()
//Data
const storeId = computed(pinia.getStore)
const isBossAccount = computed(isBoss)
const workers = ref([])
const loading = reactive({ startedLoading: true, editUser: false, deleteUser: false })
//Element Plus Tree Data
const tree = ref([])
const expanded = ref([])
const checked = ref([])
//Reference
const createWorkerRef = ref(null)

//Form
const popup = reactive({editUser: false, deleteUser: false })
const form = reactive({
  edit: {id: 0, model: {username: '', name: '', email: '', password: ''}, index: 0},
  delete: {user: null, index: 0}
})

//Mount
onBeforeMount(async () => {
  //Only boss accounts have access to this page
  if(!storeId.value || !isBossAccount.value) {
    await navigateTo('/dashboard')
    return
  }

  await getWorkers()
  loading.startedLoading = false
})
//Mount

//Prompt
function editPrompt(e, data) {
  e.stopPropagation()
  //Setup data
  const worker = workers.value[data.index].user
  form.edit.index = data.index
  form.edit.id = worker.id
  form.edit.model.username = worker.username
  form.edit.model.name = worker.name
  form.edit.model.email = worker.email
  form.edit.model.password = ''
  popup.editUser = true
}

function deletePrompt(e, data) {
  e.stopPropagation()
  //Setup data
  form.delete.index = data.index
  form.delete.user = workers.value[data.index]
  popup.deleteUser = true
}
// Prompt

//Get workers
async function getWorkers() {
  workers.value = await handleGetRequest(`/api/protected/workers/${storeId.value}`)
  
  setupTreeData()
}

//Form
async function editUser() {
  //Setup data
  const {username, name, email, password} = form.edit.model

  //Make request
  loading.editUser = true
  const response = await useFetchApi(`/api/protected/workers/edit`, {
    method: "POST",
    body: {
      id: form.edit.id,
      store_id: storeId.value,
      username: username.toLowerCase().trim(),
      name: name,
      email: email,
      password: password,
      prevUsername: workers.value[form.edit.index].user.username
    }
  })
  loading.editUser = false

  //Error case
  if (response.statusCode) {
    ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
    return
  }

  // Success case
  ElNotification({ title: 'Success', message: response.message, type: 'success'})

  //Update local data
  workers.value[form.edit.index].user = response.user
  setupTreeData()
  popup.editUser = false
}

async function deleteUser() {
  //Make request
  loading.deleteUser = true
  const response = await useFetchApi(`/api/protected/workers/delete`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      id: form.delete.user.user.id
    }
  })
  loading.deleteUser = false

  //Error case
  if (response.statusCode) {
    ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
    return
  }

  // Success case
  ElNotification({ title: 'Success', message: response.message, type: 'success'})

  //Update local data
  workers.value.splice(form.delete.index, 1)
  setupTreeData()
  popup.deleteUser = false
}

//Edit permissions
async function handleCheckChange(data, checked) {
  if(!offlineStore.getOnlineStatus()) {
    ElNotification({ title: 'Error', message: 'Feature only available online.', type: 'error'})
    return
  }

  if(data.permission) {
    //Setup data
    const currentWorker = workers.value[data.worker_index]
    currentWorker.permission[data.value] = checked

    //Make request
    const response = await useFetchApi(`/api/protected/workers/permissions/update`, {
      method: "POST",
      body: {
        store_id: storeId.value,
        worker_id: currentWorker.id,
        name: currentWorker.user.name,
        permissions: currentWorker.permission
      }
    })

    //Error case
    if (response.statusCode) {
      ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
      return
    }

    // Success case
    ElNotification({ title: 'Success', message: response.message, type: 'success'})
  }
}

//Add new user to the list
function addUser(user) {
  workers.value.push(user)
  setupTreeData()
}

//Setups data for element plus tree component
function setupTreeData() {
  tree.value = []
  checked.value = []
  let identifier = 1

  for (let i = 0; i < workers.value.length; i++) {
    let worker = workers.value[i]
    let workerTree = {id: identifier, label: worker.user.name, disabled: true, children: [], permission: false, index: i, is_worker: true}
    expanded.value.push(identifier)
    identifier += 1
    for (let permission in worker.permission) {
      workerTree.children.push({id: identifier, label: permission.replace('_', ' '), value: permission, permission: true, worker_index: i})
      if(worker.permission[permission])
        checked.value.push(identifier)

      identifier += 1
    }

    tree.value.push(workerTree)
  }
  
}
</script>

<style lang="scss" scoped>
#wrapper {
  height: calc(100vh - 40px);
  h1 {
    padding: 16px 0;
    text-align: center;
    margin: 0;
  }
  #tree-wrapper {
    margin: 16px auto 0 auto;
    height: calc(100% - 128px);
    width: calc(100% - 128px);
    max-width: 900px;
  }
  .tree-node {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    width: 280px;
  }
}
</style>
