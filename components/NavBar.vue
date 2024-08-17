<template>
  <header>
    <Icon id="logo" name="twemoji:waffle" />

    <nav v-if="status === 'authenticated'">
      <el-tooltip effect="customized" content="Dashboard" placement="bottom" :show-arrow="false">
        <NuxtLink to="/dashboard">
          <Icon name="zondicons:dashboard" />
        </NuxtLink>
      </el-tooltip>
    </nav>
    
    <el-tooltip v-if="status === 'authenticated'" effect="customized" content="Logout" placement="bottom" :show-arrow="false">
      <a id="logout" to="/dashboard" @click="logout()">
        <Icon name="fe:logout" />
      </a>
    </el-tooltip>
  </header>
</template>

<script setup>
const { signOut, status } = useAuth()
const store = useStore()

function logout() {
  store.exitStore()
  signOut({ callbackUrl: '/login' })
}
</script>

<style lang="scss">
.el-popper.is-customized {
  background: rgba(0, 0, 0, 0.5);
  color: #ffffff;
}
</style>

<style lang="scss" scoped>
header {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: black;
  position: fixed;
  top: 0;
  width: calc(100% - 32px);
  height: 24px;
  max-height: 24px;
  font-size: 20px;
  max-width:100%;
}

#logo {
  font-size: 30px;
  position: absolute;
  top: 0;
}

nav {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-height: 40px;
}

a {
  display: flex;
  cursor: pointer;
  color: white;
  text-decoration: none;
  height: 20px;
  font-size: 20px;
  align-items: center;
  padding: 8px;
  border-radius: 20px;
  transition: all 100ms ease-in-out;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

#logout {
  color: red;
}
</style>