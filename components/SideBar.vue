<template>
  <el-menu id="sidebar" :collapse="true">
    <el-menu-item class="sidebar-item" index="10">
      <el-dropdown placement="bottom-start" trigger="click">
        <div class="el-menu-tooltip__trigger">
          <Icon name="mi:user" />
        </div>
        <template #dropdown>
          <el-dropdown-menu class="text-base">
            <div class="pt-1 pb-1 px-4 w-40">My Account</div>

            <NuxtLink to="/settings">
              <el-dropdown-item class="flex item-center" divided>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="icon mr-2" width="1.2em" height="1.2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065"></path><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"></path></g></svg>
                <span>Settings</span>
              </el-dropdown-item>
            </NuxtLink>

            <el-dropdown-item class="flex item-center" divided @click="logoutUser()">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="icon mr-2 text-red-500" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M3 5c0-1.1.9-2 2-2h8v2H5v14h8v2H5c-1.1 0-2-.9-2-2zm14.176 6L14.64 8.464l1.414-1.414l4.95 4.95l-4.95 4.95l-1.414-1.414L17.176 13H10.59v-2z"></path></svg>
              <span>Logout</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </el-menu-item>

    <div class="pt-6">
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
        <NuxtLink v-if="isBossAccount" to="/workers">
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
        <NuxtLink to="/offline">
          <el-menu-item class="sidebar-item" index="8">
            <Icon name="oui:offline" class="text-red-500" />
            <template #title>Offline</template>
          </el-menu-item>
        </NuxtLink>
        <NuxtLink v-if="store.id !== storeId && isBossAccount" to="/dashboard" @click="exitStore()">
          <el-menu-item class="sidebar-item" index="9">
            <Icon name="tabler:door-exit" class="text-red-500" />
            <template #title>Exit Store</template>
          </el-menu-item>
        </NuxtLink>
      </div>
    </div>
  </el-menu>
</template>

<script setup>
//Imports
import { ElNotification } from 'element-plus'
const store = useStore()
const offlineStore = useOfflineStore()
const { isBoss, getPermissions } = useChecks()
const { logout } = useAuth()
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
    ElNotification({ title: 'Success', message: 'You exited a store', type: 'success' })
  }
}

async function logoutUser() {
  store.exitStore()
  await logout()
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
  text-align: center;
  border-color: #2D2D2D;
  .sidebar-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #bfbfbf;
    padding: 0;
    svg {
      font-size: 16px;
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