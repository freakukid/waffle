<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" title="Create Worker" @opened="focusInput">
      <el-form :model="form" label-position="top" @submit.prevent="createUser()">
        <el-form-item label="Username" prop="username"
        :rules="[{required: true, message: 'Username is required', trigger: 'blur'},
        { min: 3, max: 15, message: 'Username must be between 3 and 15 characters', trigger: 'blur' },
        { validator: validateUsername, trigger: 'change' }]"
        >
          <el-input v-model="form.username" :value="form.username" ref="usernameInput" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Name" prop="name" :rules="[{ required: true, message: 'Name is required', trigger: 'blur' }]">
          <el-input v-model="form.name" :value="form.name" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Password" prop="password"
        :rules="[{ required: true, message: 'Password is required', trigger: 'blur' }, 
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }]"
        >
          <el-input v-model="form.password" :value="form.password"  type="password" placeholder="******" autocomplete="off" />
        </el-form-item>

        <el-form-item label="Email (optional)" prop="email" :rules="[{ validator: validateOptionalEmail, trigger: 'blur' }]">
          <el-input v-model="form.email" :value="form.email" autocomplete="off" />
        </el-form-item>

        <div class="dialog-footer">
          <el-button @click="popup = false">Cancel</el-button>
          <el-tooltip v-if="!pinia.getOnlineStatus()" content="Feature only available online." placement="top">
            <el-button disabled type="success">Create</el-button>
          </el-tooltip>
          <el-button v-else type="success" @click="createUser()" :loading="loading.createUser" native-type="submit">Create</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- Popup -->
    
    <!-- Add Btn -->
    <el-tooltip v-if="!pinia.getOnlineStatus()" content="Feature only available online." placement="top">
      <el-button disabled type="success">Create Worker</el-button>
    </el-tooltip>
    <el-button v-else @click="openPopup()" type="success">Create Worker</el-button>
    <!-- Add Btn -->
  </div>
</template>

<script setup>
//Imports
const { validateUsername, validateOptionalEmail } = useValidator()
const { notify } = useNotification()
const pinia = useStore()

//Data
const storeId = computed(pinia.getStore)
const loading = reactive({ createUser: false })
const popup = ref(false)
const form = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
})

//Component Emits,Props
const emits = defineEmits(['addUser'])

//Focus Input
const usernameInput = ref()
const focusInput = () => {
  usernameInput.value?.focus()
}

//Prompt
function openPopup() {
  form.username = ''
  form.name = ''
  form.email = ''
  form.password = ''
  popup.value = true
}

//Request
async function createUser() {  
  //Setup data
  const {username, name, email, password} = form

  //Make request
  loading.createUser = true
  const response = await useFetchApi(`/api/protected/workers/create`, {
    method: "POST",
    body: {
      store_id: storeId.value,
      username: username.toLowerCase().trim(),
      name: name,
      email: email,
      password: password
    }
  })
  loading.createUser = false

  //Error case
  if (response.statusCode) {
    notify({ title: 'Error', text: response.statusMessage, type: 'error'})
    return
  }

  // Success case
  notify({ title: 'Success', text: response.message, type: 'success'})

  //Update local data
  if('user' in response) {
    emits('addUser', response.user)
  }
  popup.value = false

  // workers.value.push(response.user)
  // setupTreeData()
}


async function addColumn() {
  const columnName = form.name.trim()

  //Check if we at least have a string
  if(!columnName) {
    notify({ title: 'Warning', text: 'No column name was provided.', type: 'warn'})
    return
  }

  //Check if this column already exist
  if (props.inventory.columns.includes(columnName)) {
    notify({ title: 'Warning', text: `Column '${columnName}' already exist.`, type: 'warn'})
    return
  }

  //Make inventory request
  loading.addColumn = true
  let inventory = await handleInventoryRequest({
    path: 'add-column',
    data: { store_id: props.storeId, column_name: columnName },
  })

  //Emit to parent component
  if(inventory)
    emits('setInventory', inventory)

  //Loading complete, Close popup
  loading.addColumn = false
  popup.value = false
}
</script>