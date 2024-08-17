<template>
  <div id="worker-page">
    <div id="wrapper">
      <h1>Worker Permissions</h1>
      <div id="tree-wrapper">
        <el-tree
          v-if="!loading.startedLoading"
          :data="tree"
          :default-expanded-keys="expanded"
          :default-checked-keys="checked"
          show-checkbox
          node-key="id"
          @check-change="handleCheckChange"
        >
          <template #default="{ node, data }">
            <span class="tree-node">
              <span>{{ node.label }}</span>

              <span v-if="!data.permission">
                <el-button type="warning" size="small" plain @click="editPrompt($event, data)">
                  Edit
                </el-button>

                <el-button type="danger" size="small" plain @click="deletePrompt($event, data)">
                  Delete
                </el-button>
              </span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- Popup -->
    <el-dialog v-model="popup.deleteUser" title="Delete User">
      <p style="text-align: center; color: #ff4545; font-size: 24px;">
        <b>Are you sure you want to delete {{form.delete?.user?.user?.name}}. This cannot be reversed!</b>
      </p>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="popup.deleteUser = false">Cancel</el-button>
          <el-button type="danger" @click="deleteUser()" :loading="loading.deleteUser">Delete</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>



<script setup>
//Imports
const { notify } = useNotification()
const pinia = useStore()
//Data
const storeId = computed(() => pinia.store)
const workers = ref([])
const loading = reactive({ startedLoading: true, deleteUser: false })
//Element Plus Tree Data
const tree = ref([])
const expanded = ref([])
const checked = ref([])
//Form
const popup = reactive({ deleteUser: false })
const form = reactive({
  edit: {user: null, index: 0},
  delete: {user: null, index: 0}
})

//Mount
onBeforeMount(async () => {
  if(!storeId.value) {
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
  form.delete.index = data.index
  form.delete.user = workers.value[data.index]
  popup.editUser = true

  console.log(JSON.stringify(data))
}

function deletePrompt(e, data) {
  e.stopPropagation()
  //Setup data
  form.delete.index = data.index
  form.delete.user = workers.value[data.index]
  popup.deleteUser = true

  console.log(JSON.stringify(form.delete.user))
}
// Prompt

//Form
async function deleteUser() {
  loading.deleteUser = true
  const response = await useFetchApi(`/api/protected/workers/delete`, {
    method: "POST",
    body: {
      id: form.delete.user.user.id
    }
  })

  //Error case
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  // Success case
  notify({ title: 'Success', text: response.message, type: 'success'})

  //Update local data
  workers.value.splice(form.delete.index, 1)
  setupTreeData()
  loading.deleteUser = false
  popup.deleteUser = false


  console.log(JSON.stringify(workers.value))
}

//Edit permissions
async function handleCheckChange(data, checked) {
  if(data.permission) {
    const currentWorker = workers.value[data.worker_index]
    currentWorker.permission[data.value] = checked

    const response = await useFetchApi(`/api/protected/workers/set-permissions`, {
      method: "POST",
      body: {
        worker_id: currentWorker.id,
        name: currentWorker.user.name,
        permissions: currentWorker.permission
      }
    })

    //Error case
    if (response.statusCode) {
      notify({ title: 'Error', text: response.statusMessage, type: 'error'})
      return
    }

    // Success case
    notify({ title: 'Success', text: response.message, type: 'success'})
  }
}

//Get workers
async function getWorkers() {
  workers.value = await useFetchApi(`/api/protected/workers/${storeId.value}`)

  setupTreeData()

  console.log(JSON.stringify(workers.value))
}

//Setups data for element plus tree component
function setupTreeData() {
  tree.value = []
  let identifier = 1
  for (let i = 0; i < workers.value.length; i++) {
    let worker = workers.value[i]
    let workerTree = {id: identifier, label: worker.user.name, disabled: true, children: [], permission: false, index: i}
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
  width: 100vw;
  height: calc(100vh - 40px);
  h1 {
    padding: 16px 0;
    text-align: center;
    margin: 0;
  }
  #tree-wrapper {
    margin: 0 auto;
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
