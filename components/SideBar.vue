<template>
  <el-menu id="sidebar" :collapse="true">
    <div>
      <NuxtLink to="/dashboard" class="block text-center mt-4 mb-2">
        <el-image class="rounded-lg h-9 mx-auto" src="/logo/dark-logo-64x64.png" />
      </NuxtLink>

      <NuxtLink to="/dashboard">
        <el-menu-item class="sidebar-item" index="1" :class="{active: route.name === 'dashboard'}">
          <Icon name="zondicons:dashboard" />
          <template #title>Dashboard</template>
        </el-menu-item>
      </NuxtLink>
      <div v-if="storeId">
        <NuxtLink :to="isBossAccount ? '/boss/inventory' : '/worker/inventory'">
          <el-menu-item class="sidebar-item" index="2" :class="{active: route.name === 'boss-inventory' || route.name === 'worker-inventory'}">
            <Icon name="gravity-ui:boxes-3" />
            <template #title>Inventory</template>
          </el-menu-item>
        </NuxtLink>
        <NuxtLink v-if="permissions?.view_log" to="/logs">
          <el-menu-item class="sidebar-item" index="3" :class="{active: route.name === 'logs'}">
            <Icon name="mingcute:inventory-line" />
            <template #title>Logs</template>
          </el-menu-item>
        </NuxtLink>
        <NuxtLink v-if="isBossAccount" to="/boss/workers">
          <el-menu-item class="sidebar-item" index="4" :class="{active: route.name === 'boss-workers'}">
            <Icon name="gravity-ui:person-worker" />
            <template #title>Workers</template>
          </el-menu-item>
        </NuxtLink>
        <NuxtLink v-if="permissions?.make_transactions" to="/cashier">
          <el-menu-item class="sidebar-item" index="5" :class="{active: route.name === 'cashier'}">
            <Icon name="streamline:money-cashier-shop-shopping-pay-payment-cashier-store-cash-register-machine" />
            <template #title>Cashier</template>
          </el-menu-item>
        </NuxtLink>
        <NuxtLink v-if="permissions?.make_transactions" to="/layaway">
          <el-menu-item class="sidebar-item" index="6" :class="{active: route.name === 'layaway'}">
            <Icon name="tabler:shopping-cart-pause" />
            <template #title>Layaway</template>
          </el-menu-item>
        </NuxtLink>
        <NuxtLink v-if="permissions?.make_transactions" to="/transactions">
          <el-menu-item class="sidebar-item" index="7" :class="{active: route.name === 'transactions'}">
            <Icon name="uil:transaction" />
            <template #title>Transactions</template>
          </el-menu-item>
        </NuxtLink>
        <NuxtLink v-if="offlineRequests.length" to="/offline">
          <el-menu-item class="sidebar-item" index="8">
            <Icon name="oui:offline" class="text-red-500" />
            <template #title>Offline</template>
          </el-menu-item>
        </NuxtLink>
        <NuxtLink v-if="store.id !== storeId && isBossAccount" to="/dashboard" @click="exitStore()">
          <el-menu-item class="sidebar-item" index="8">
            <Icon name="tabler:door-exit" class="text-red-500" />
            <template #title>Exit Store</template>
          </el-menu-item>
        </NuxtLink>
      </div>
    </div>

    <el-menu-item class="sidebar-item" index="9" @click="logout()">
      <Icon name="fe:logout" class="text-red-500" />
      <template #title>Logout</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
//Imports
const { notify } = useNotification()
const store = useStore()
const offlineStore = useOfflineStore()
const { isBoss, getPermissions } = useChecks()
const { signOut } = useAuth()
const route = useRoute()

//Data
const storeId = computed(() => store.store)
const offlineRequests = computed(offlineStore.getRequests)
const isBossAccount = computed(isBoss)
const permissions = ref({make_transactions: true, view_log: true})

//General
const loading = ref(true)

//Mount
onBeforeMount(async () => {
  if(!isBossAccount.value) {
    permissions.value = await getPermissions()
  }

  loading.value = false
})
//Mount

function exitStore(name) {
  if(isBossAccount.value) {
    store.exitStore()
    notify({ title: 'Success', text: 'You exited a store', type: 'success'})
  }
}

async function logout() {
  store.exitStore()
  await signOut({ callbackUrl: '/login' })
}
</script>

<style lang="scss">
#sidebar {
  position: fixed;
  top: 0;
  height: 100vh;
  z-index: 10;
  background: #111;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  .sidebar-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #bfbfbf;
    padding: 0;
    svg {
      font-size: 18px;
    }
    &.is-disabled {
      color: #ffffff;
    }
    &:hover, &.active {
      background-color: transparent !important;
      .el-menu-tooltip__trigger {
        background: #ffffff14;
      }
    }
  }

  .el-menu-item .el-menu-tooltip__trigger {
    position: unset;
    padding: 0;
    width: 44px;
    height: 44px;
    justify-content: center;
    border-radius: 12px;
    transition: all 200ms ease-in-out;
  }
}
</style>