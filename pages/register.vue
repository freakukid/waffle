<template>
  <div class="flex h-screen w-screen items-center justify-center">
    <UiShootingStars />
    
    <div class="wrapper">
      <h1 class="text-4xl text-center font-bold">{{ $t('title.Register') }}</h1>

      <el-form class="py-8 px-4" ref="formRef" :model="form" :rules="rules" @submit.prevent>
        <el-form-item prop="username">
          <label>{{$t('label.username')}}</label>
          <el-input v-model="form.username" type="text" autocomplete="off" autofocus />
        </el-form-item>

        <el-form-item prop="name">
          <label>{{$t('label.name')}}</label>
          <el-input v-model="form.name" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item prop="email">
          <label>{{$t('label.email')}}</label>
          <el-input v-model="form.email" type="text" autocomplete="off" />
        </el-form-item>

        <el-form-item prop="password">
          <label>{{$t('label.password')}}</label>
          <el-input v-model="form.password" type="password" autocomplete="off" />
        </el-form-item>

        <el-form-item prop="storeName">
          <label>{{$t('label.Store Name')}}</label>
          <el-input v-model="form.storeName" type="text" autocomplete="off" />
        </el-form-item>

        <el-button class="!h-10 w-full mt-6" type="primary" native-type="submit" @click="register" :loading="loading">{{ $t('title.Register') }}</el-button>

        <div class="flex items-center justify-center flex-wrap text-center mt-8">
          {{ $t("label.Have an account?") }}&nbsp;<el-link class="!text-base" :underline="false" href="/login" type="primary">{{ $t('label.Login') }}</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { $t } = useNuxtApp()
const { fetch } = useUserSession()
const { sendNotification } = useHelpers()
const { validateUsername } = useValidator()

const hasStoreCode = route.query.code ? route.query.code : ''

const loading = ref(false)
const formRef = ref(null)
const form = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  storeName: ''
})

const rules = reactive({
  username: [
    { required: true, message: $t('invalid.Username is required'), trigger: 'blur' },
    { min: 3, max: 15, message: $t('invalid.Username must be between 3 and 15 characters'), trigger: 'blur' },
    { validator: validateUsername, trigger: 'change' }
  ],
  name: [
    { required: true, message: $t('invalid.Name is required'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: $t('invalid.Password is required'), trigger: 'blur' },
    { min: 6, message: $t('invalid.Password must be at least 6 characters long'), trigger: 'blur' }
  ],
  email: [
    { required: true, message: $t('invalid.Email is required'), trigger: 'blur' },
    { type: 'email', message: $t('invalid.Invalid email format'), trigger: ['blur', 'change'] }
  ],
  storeName: [
    { required: true, message: $t('invalid.Store name is required'), trigger: 'blur' },
    { min: 2, message: $t('invalid.The name must consist of at least 2 characters'), trigger: 'blur' },
  ]
})

async function register() {
  alert(formRef.value)
  formRef.value.validate(async (valid) => {
    alert(valid)
    if(valid) {
      const username = form.username.toLowerCase().trim()
      //Make Request
      loading.value = true

      const res = await useFetchApi(`/api/auth/register`, {
        method: "POST",
        body: {
          username: username,
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          storeName: form.storeName.trim()
        }
      })

      //Show error if a failed request
      if (res.statusCode) {
        sendNotification(res.statusMessage, 'error')
        loading.value = false
        return
      }

      //Login
      const response = await useFetchApi(`/api/auth/login`, {
        method: "POST",
        body: { username: username, password: form.password }
      })

      if (response.error) {
        sendNotification(response.error, 'error')
        return
      } else {
        sendNotification(res.message, 'success')
      }

      //Go to dashboard page
      await fetch()
      loading.value = false
      await navigateTo('/dashboard')
    }
  })
}

// const register = async (formEl) => {
//   formEl.validate()
//   loading.value = true
//   const { data, error } = await useFetch(`/api/auth/register`, {
//     method: "POST",
//     body: {
//       username: username,
//       name: form.name.trim(),
//       email: form.email.trim(),
//       password: form.password,
//       storeName: form.storeName.trim()
//     }
//   })

//   if (error.value) {
//     sendNotification(error.value.statusMessage, 'error')
//     return
//   }

//   sendNotification(data.value.message, 'success')

//   //Login
//   const response = await useFetchApi(`/api/auth/login`, {
//     method: "POST",
//     body: { username: username, password: form.password }
//   })

//   if (response.error) {
//     sendNotification(response.error, 'error')
//     return
//   }

//   //Go to dashboard page
//   await fetch()
//   loading.value = false
//   await navigateTo('/dashboard')
// }
</script>

<style lang="scss" scoped>
.wrapper {
  background: rgba(255, 255, 255, 0.02);
  width: 450px;
  max-width: calc(100% - 32px);
  border-radius: 30px;
  padding: 32px 16px;
  position: relative;
  backdrop-filter: blur(10px);
}
</style>