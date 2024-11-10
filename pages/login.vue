<template>
  <div id="login-page">
    <el-form id="form" :model="form" label-width="auto" label-position="top" @submit.prevent>
      <el-form-item :label="$t('label.username')" prop="username"  :rules="[{ required: true, message: $t('error.username is required') }]">
        <el-input v-model="form.username" type="text" autocomplete="off" autofocus />
      </el-form-item>
      <el-form-item :label="$t('label.password')" prop="password" :rules="[{ required: true, message: $t('error.password is required') }]">
        <el-input v-model="form.password" type="password" autocomplete="off" autofocus />
      </el-form-item>

      <el-button id="login" type="primary" native-type="submit" @click="login" :loading="loading">{{ $t('btn.login') }}</el-button>

      <div class="msg">
        {{ $t("label.don't have an account?") }}&nbsp;<el-link :underline="false" href="/register" type="primary">{{ $t('label.register') }}</el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

//Import
import { ElNotification } from 'element-plus'
const { fetch } = useUserSession()
const { getAuthUser } = useAuth()
const { $t, $switchLocale } = useNuxtApp()
const pinia = useStore()

//Form
const loading = ref(false)
const form = reactive({
  username: '',
  password: ''
})

const login = async () => {
  //Make Request
  loading.value = true
  const response = await useFetchApi(`/api/auth/login`, {
    method: "POST",
    body: { username: form.username, password: form.password }
  })
  
  //Show error if a failed request
  if (response.statusCode) {
    ElNotification({ title: $t('notification.error'), message: response.statusMessage, type: 'error'})
    loading.value = false
    return
  } else {
    ElNotification({ title: $t('notification.success'), message: $t('notification.login successful'), type: 'success'})
  }

  await fetch()

  //Set store for workers
  const user = getAuthUser()
  if(user && !user.is_boss)
    pinia.setStore(user.worker.store_id)

  //Set language
  $switchLocale(user.language ? user.language : 'en')
  
  //Go to dashboard page
  await navigateTo('/dashboard')
}
</script>

<style lang="scss">
#login-page {
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #161616 inset !important; /* Match this to input's background */
    box-shadow: 0 0 0 1000px #161616 inset !important; /* Match this to input's background */
    transition: background-color 5000s ease-in-out 0s; /* Prevent changing background color */
  }
}
</style>

<style lang="scss" scoped>
#login-page {
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

  #login {
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