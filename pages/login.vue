<template>
  <div id="login-page">
    <el-form id="form" :model="form" label-width="auto" label-position="top" @submit.prevent>
      <el-form-item label="Username" prop="username"  :rules="[{ required: true, message: 'Username is required' }]">
        <el-input v-model="form.username" type="text" autocomplete="off" autofocus />
      </el-form-item>
      <el-form-item label="Password" prop="password" :rules="[{ required: true, message: 'Password is required' }]">
        <el-input v-model="form.password" type="password" autocomplete="off" autofocus />
      </el-form-item>

      <el-button id="login" type="primary" native-type="submit" @click="login">Login</el-button>

      <div class="msg">
        Don't have an account?&nbsp;<el-link :underline="false" href="/register" type="primary">Register</el-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
//Import
const { signIn, data } = useAuth()
import { ElNotification } from 'element-plus'
const pinia = useStore()

definePageMeta({
  layout: "auth",
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard',
  }
})

//Form
const form = reactive({
  username: '',
  password: ''
})

const login = async () => {
  //Make Request
  const response = await signIn('credentials', { redirect: false, username: form.username, password: form.password })
  
  //Show error if a failed request
  if (response.error) {
    ElNotification({ title: 'Error', message: response.error, type: 'error'})
    return
  }

  //Set store for workers
  const user = data?.value?.user
  if(user && !user.is_boss)
    pinia.setStore(user.worker.store_id)
  
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