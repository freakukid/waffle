<template>
  <div>
    <!-- Popup -->
    <el-dialog v-model="popup" :title="$t(`label.create worker`)" @opened="focusInput">
      <el-form :model="form" label-position="top" @submit.prevent="createUser()">
        <el-form-item :label="$t('label.username')" prop="username"
        :rules="[
          {required: true, message: $t('invalid.Username is required'), trigger: 'blur'},
          { min: 3, max: 15, message: $t('invalid.Username must be between 3 and 15 characters'), trigger: 'blur' },
          { validator: validateUsername, trigger: 'change' }
        ]"
        >
          <el-input v-model="form.username" :value="form.username" ref="usernameInput" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t('label.name')" prop="name" :rules="[{ required: true, message: $t('invalid.Name is required'), trigger: 'blur' }]">
          <el-input v-model="form.name" :value="form.name" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="$t('label.password')" prop="password"
          :rules="[
            { required: true, message: $t('invalid.Password is required'), trigger: 'blur' }, 
            { min: 6, message: $t('invalid.Password must be at least 6 characters'), trigger: 'blur' }
          ]"
        >
          <el-input v-model="form.password" :value="form.password"  type="password" placeholder="******" autocomplete="off" />
        </el-form-item>

        <el-form-item :label="`${$t('label.email')} (${$t('label.optional')})`" prop="email" :rules="[{ validator: validateOptionalEmail, trigger: 'blur' }]">
          <el-input v-model="form.email" :value="form.email" autocomplete="off" />
        </el-form-item>

        <div class="dialog-footer">
          <el-button @click="popup = false">{{$t(`label.cancel`)}}</el-button>
          <el-tooltip v-if="!offlineStore.getOnlineStatus()" :content="$t(`tippy.feature only available online`)" placement="top">
            <el-button disabled type="success">{{$t(`label.create`)}}</el-button>
          </el-tooltip>
          <el-button v-else type="success" @click="createUser()" :loading="loading.createUser" native-type="submit">{{$t(`label.create`)}}</el-button>
        </div>
      </el-form>
    </el-dialog>
    <!-- Popup -->
  </div>
</template>

<script setup>
//Imports
const { validateUsername, validateOptionalEmail } = useValidator()
import { ElNotification } from 'element-plus'
const pinia = useStore()
const offlineStore = useOfflineStore()

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
    ElNotification({ title: 'Error', message: response.statusMessage, type: 'error'})
    return
  }

  // Success case
  ElNotification({ title: 'Success', message: response.message, type: 'success'})

  //Update local data
  if('user' in response) {
    emits('addUser', response.user)
  }
  popup.value = false
}

// Expose the openPopup method to parent
defineExpose({
  openPopup
})
</script>