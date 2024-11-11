<template>
  <div id="register-page">
    <el-form id="form" ref="formRef" :model="form" :rules="rules" label-width="auto" label-position="top" @submit.prevent>
      <el-form-item label="Username" prop="username">
        <el-input v-model="form.username" type="text" autocomplete="off" autofocus />
      </el-form-item>

      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" type="text" autocomplete="off" />
      </el-form-item>

      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" type="text" autocomplete="off" />
      </el-form-item>

      <el-form-item label="Password" prop="password">
        <el-input v-model="form.password" type="password" autocomplete="off" />
      </el-form-item>

      <el-form-item label="Store Name" prop="storeName">
        <el-input v-model="form.storeName" type="text" autocomplete="off" />
      </el-form-item>

      <el-button id="register" type="primary" native-type="submit" @click="register(formRef)">Register</el-button>

      <div class="msg">
        Have an account?&nbsp;<el-link :underline="false" href="/login" type="primary">Login</el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { fetch } = useUserSession()
const { sendNotification } = useHelpers()
const { validateUsername, validateEmail } = useValidator()

const hasStoreCode = route.query.code ? route.query.code : ''

const loading = ref(false)
const formRef = ref()
const form = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  storeName: ''
})

const rules = reactive({
  username: [
    { required: true, message: 'Username is required', trigger: 'blur' },
    { min: 3, max: 15, message: 'Username must be between 3 and 15 characters', trigger: 'blur' },
    { validator: validateUsername, trigger: 'change' }
  ],
  name: [
    { required: true, message: 'Name is required', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { min: 6, message: 'Password must be at least 6 characters long', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { validator: validateEmail, trigger: 'change' }
  ],
  storeName: [
    { required: true, message: 'Store Name is required', trigger: 'blur' },
    { min: 2, message: 'Store Name must be at least 2 characters long', trigger: 'blur' },
  ]
})

const register = async (formEl) => {
  formEl.validate()
  const username = form.username.toLowerCase().trim()
  loading.value = true
  const { data, error } = await useFetch(`/api/auth/register`, {
    method: "POST",
    body: {
      username: username,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      storeName: form.storeName.trim()
    }
  })

  if (error.value) {
    sendNotification(error.value.statusMessage, 'error')
    return
  }

  sendNotification(data.value.message, 'success')

  //Login
  const response = await useFetchApi(`/api/auth/login`, {
    method: "POST",
    body: { username: username, password: form.password }
  })

  if (response.error) {
    sendNotification(response.error, 'error')
    return
  }

  //Go to dashboard page
  await fetch()
  loading.value = false
  await navigateTo('/dashboard')
}
</script>

<style lang="scss">
#register-page {
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #161616 inset !important; /* Match this to input's background */
    box-shadow: 0 0 0 1000px #161616 inset !important; /* Match this to input's background */
    transition: background-color 5000s ease-in-out 0s; /* Prevent changing background color */
  }
}
</style>

<style lang="scss" scoped>
#register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;

  #form {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    padding: 40px;
    backdrop-filter: blur(10px);
  }

  #register {
    width: 100px;
    margin: 10px 0 20px;
  }

  .msg {
    display: flex;
    font-size: 14px;
    line-height: 21px;
  }
}
</style>