<template>
  <div class="flex h-screen w-screen items-center justify-center">
    <UiShootingStars />
    
    <div class="wrapper">
      <h1 class="text-4xl text-center font-bold">{{ $t('btn.login') }}</h1>

      <el-form class="py-8 px-4" :model="form" :rules="rules" @submit.prevent>
        <el-form-item prop="username">
          <label>{{$t('label.username')}}</label>
          <el-input v-model="form.username" type="text" autocomplete="off" autofocus />
        </el-form-item>

        <el-form-item prop="password">
          <label>{{$t('label.password')}}</label>
          <el-input v-model="form.password" type="password" autocomplete="off" />
        </el-form-item>

        <el-button class="!h-10 w-full mt-6" type="primary" native-type="submit" @click="login" :loading="loading">{{ $t('btn.login') }}</el-button>

        <div class="flex items-center justify-center flex-wrap text-center mt-8">
          {{ $t("label.don't have an account?") }}&nbsp;<el-link class="!text-base" :underline="false" href="/register" type="primary">{{ $t('label.register') }}</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

//Import
const { fetch } = useUserSession()
const { getAuthUser } = useAuth()
const { sendNotification } = useHelpers()
const { $t, $switchLocale } = useNuxtApp()
const pinia = useStore()

const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const rules = reactive({
  username: [{ required: true, message: $t('invalid.Username is required') }],
  password: [{ required: true, message: $t('invalid.Password is required') }],
})

async function login() {
  //Make Request
  loading.value = true
  const response = await useFetchApi(`/api/auth/login`, {
    method: "POST",
    body: { username: form.username.toLowerCase(), password: form.password }
  })
  
  //Show error if a failed request
  if (response.statusCode) {
    sendNotification(response.statusMessage, 'error')
    loading.value = false
    return
  } else {
    sendNotification(response.message, 'success')
  }

  await fetch()

  //Set store for workers
  pinia.exitStore()
  const user = getAuthUser()
  if(user && !user.is_boss)
    pinia.setStore(user.worker.store_id)

  //Set language
  $switchLocale(user.language ? user.language : 'en')
  
  //Go to dashboard page
  await navigateTo('/dashboard')
}
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