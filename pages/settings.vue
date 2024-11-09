<template>
  <div class="flex">
    <el-menu id="settings-sidebar">
      <h1 class="text-base pb-4">Settings</h1>
      <label class="block text-xs opacity-60 mb-1">General</label>
      <el-menu-item class="sidebar-item" :class="{active: tab === 'account'}" index="1" @click="tab = 'account'">
        <Icon name="mingcute:user-setting-fill" /> Account
      </el-menu-item>
      <el-menu-item class="sidebar-item" :class="{active: tab === 'preference'}" index="1" @click="tab = 'preference'">
        <Icon name="oui:controls-horizontal" /> Preference
      </el-menu-item>
    </el-menu>
    <div class="flex justify-center w-full">
      <div v-if="tab === 'account'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">Account</h1>
        </div>

        <el-form class="px-6" :model="form" disabled label-position="top">
          <el-form-item label="Username" prop="username"
            :rules="[{ min: 3, max: 15, message: 'Username must be between 3 and 15 characters', trigger: 'blur' },
            { validator: validateUsername, trigger: 'change' }]"
          >
            <el-input v-model="form.username" :value="form.username" autocomplete="off" />
          </el-form-item>

          <el-form-item label="Name" prop="name">
            <el-input v-model="form.name" :value="form.name" autocomplete="off" />
          </el-form-item>

          <el-form-item label="Email" prop="email" :rules="[{ validator: validateOptionalEmail, trigger: 'blur' }]">
            <el-input v-model="form.email" :value="form.email" autocomplete="off" />
          </el-form-item>

          <el-form-item label="New Password" prop="password" :rules="[{ min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' }]">
            <el-input v-model="form.password" :value="form.password"  type="password" placeholder="******" autocomplete="off" />
          </el-form-item>
        </el-form>

        <div class="px-6 py-2">
          <el-button class="!block ml-auto" disabled native-type="submit">Save</el-button>
        </div>
      </div>

      <div v-if="tab === 'preference'" class="tab">
        <div class="pt-8 pb-4">
          <h1 class="text-xl text-white">Preference</h1>

          <div class="px-6 py-4">
            <div>
              <label class="block text-sm opacity-80 mb-2">Language</label>
              <el-select v-model="form.language" placeholder="Language">
                <el-option label="English" value="en" />
                <el-option label="Spanish" value="es" />
              </el-select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup>
definePageMeta({
  middleware: 'unauth'
})

const { getAuthUser } = useAuth()
const { validateUsername, validateOptionalEmail } = useValidator()

const tab = ref('account')
const user = ref(getAuthUser())
const form = reactive({
  username: user.value.username,
  name: user.value.name,
  password: '',
  email: user.value.email,
  language: user.value.language
})

//Mount
onBeforeMount(async () => {
  // console.log(JSON.stringify(user.value))
})
</script>

<style lang="scss" scoped>
#settings-sidebar {
  height: 100vh;
  width: 220px;
  padding: 16px 8px;
  border-color: #2b2b2b;
  .sidebar-item {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #bfbfbf;
    padding: 16px;
    font-size: 16px;
    height: 40px;
    border-radius: 8px;
    margin: 4px 0;
    user-select: none;
    &.is-disabled {
      color: #ffffff;
    }
    &:hover, &.active {
      background: #ffffff14;
      color: #ffffff;
    }
  }
}

.tab {
  padding: 0 16px 0 16px;
  max-width: 600px;
  width: 100%;
}
</style>