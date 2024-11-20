<template>
  <div class="flex h-screen w-screen items-center justify-center">
    <UiShootingStars />
    
    <div class="wrapper">
      <h1>{{ $t('btn.login') }}</h1>

      <el-form id="form" ref="formRef" :model="form" :rules="rules" label-width="auto" label-position="top" @submit.prevent>
        <el-form-item :label="$t('label.username')" prop="username">
          <el-input v-model="form.username" type="text" autocomplete="off" autofocus />
        </el-form-item>

        <el-form-item :label="$t('label.password')" prop="password">
          <el-input v-model="form.password" type="password" autocomplete="off" />
        </el-form-item>

        <el-button id="login" type="primary" native-type="submit" @click="login" :loading="loading">{{ $t('btn.login') }}</el-button>

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
    body: { username: form.username, password: form.password }
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
.wrapper {
  width: 450px;
  max-width: calc(100% - 32px);
  border-radius: 30px;
  padding: 32px 16px;
  background: rgba(255, 255, 255, 0.02);
  position: relative;
  backdrop-filter: blur(10px);
  h1 {
    font-weight: bold;
    font-size: 36px;
    text-align: center;
  }
  form {
    padding: 32px 16px;
    label {
      font-size: 16px;
      &::before {
        display: none;
      }
    }
    .el-form-item {
      margin-bottom: 32px;
      .el-form-item__error {
        color: #ff7f7f;
        padding-top: 6px;
      }
    }
    .el-input__wrapper {
      border: 2px solid rgba(255, 255, 255, 0.15);
      box-shadow: rgba(255, 255, 255, 0.1) 0px 0px 16px;
      border-radius: 6px;
      transition: all 200ms ease-in-out;
      &.is-focus, &:hover {
        border: 2px solid rgba(255, 255, 255, 0.5);
        box-shadow: rgba(255, 255, 255, 0.2) 0px 0px 16px;
      }
    }
    .is-error .el-input__wrapper {
      border: 2px solid rgba(255, 100, 100, 0.2);
      box-shadow: rgba(255, 100, 100, 0.15) 0px 0px 16px;
      &.is-focus, &:hover {
        border: 2px solid rgba(255, 100, 100, 0.5);
        box-shadow: rgba(255, 100, 100, 0.2) 0px 0px 16px;
      }
    }
  }
}

#login {
  width: 100%;
  font-size: 16px;
  height: 40px;
  font-weight: bold;
  background: #5c40e6;
  box-shadow: rgba(92, 64, 230, 0.3) 0px 0px 16px;
  border: none;
  margin-top: 24px;
  transition: all 200ms ease-in-out;
  &:hover {
    box-shadow: rgba(92, 64, 230, 0.6) 0px 0px 16px;
    background: #5133e4;
  }
}

//This is for autofill on firefox
input:-webkit-autofill {
  box-shadow: 0 0 0px 1000px #1e1e1e inset; /* Change white to your desired background color */
  -webkit-text-fill-color: white; /* Change text color if needed */
}
</style>