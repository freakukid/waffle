<template>
  <div id="login-body" class="flex h-screen w-screen items-center justify-center">

    <div class="sky">
      <span />
      <span />
      <span />
    </div>

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
#login-body {
  background: url('/public/bg.png');
  background-position: center;
  background-size: cover;
  background-attachment: fixed;
  background-repeat: no-repeat;
}

.sky {
  position: fixed;
  top: 10%;
  height: 50%;
  width: 100vw;
  transform: rotateZ(36deg);
  span {
    position: absolute;
    top: 0;
    left: 0;
    height: 1.5px;
    background: linear-gradient(-45deg, #e8eefa, rgba(0,0,255,0));
    filter: drop-shadow(0 0 6px #f2f6ff);
    animation: tail 30s ease-in-out infinite, shooting 30s ease-in-out infinite;
    &::before, &::after {
      position: absolute;
      content: "";
      top: calc(50% - 1px);
      right: 0;
      height: 1px;
      background: linear-gradient(-45deg, rgba(0,0,255,0), #e8eefa, rgb(206, 206, 206));
      transform: translateX(50%) rotateZ(45deg);
      animation: shining 30s ease-in-out infinite;
    }
  }
  span:after {
    transform: translateX(50%) rotateZ(-45deg);
  }
  span:nth-child(1) {
    top: calc(100% - 200px);
    left: calc(50% - 450px);
    animation-delay: 10s;
    &::before, &::after {
      animation-delay: 10s;
    }
  }
  span:nth-child(2) {
    top: calc(25% - 175px);
    left: calc(33% + 200px);
    animation-delay: 20s;
    &::before, &::after {
      animation-delay: 20s;
    }
  }
  span:nth-child(3) {
    top: calc(100% - 0px);
    left: calc(50% - 800px);
    animation-delay: 0s;
    &::before, &::after {
      animation-delay: 0s;
    }
  }
}

@keyframes tail {
  90% {
    width: 0; /* Almost gone */
  }
  93% {
    width: 100px; /* Maximum width reached just before disappearing */
  }
  100% {
    width: 0; /* Fully gone */
  }
}

@keyframes shining {
  90% {
    width: 0; /* Almost gone */
  }
  93% {
    width: 8px; /* Maximum shining width just before disappearing */
  }
  100% {
    width: 0; /* Fully gone */
  }
}

@keyframes shooting {
  90% {
    transform: translateX(0); /* Start position */
  }
  100% {
    transform: translateX(1000px); /* Final position */
  }
}

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