<template>
  <nav ref="sidebar" :class="{close: !isExpanded}">
    <header @click="isExpanded = !isExpanded">
      <span>Legitski</span>
      <div id="sidebar-toggle">
        <Icon name="material-symbols:keyboard-double-arrow-left" />
      </div>
    </header>

    <ul>
      <NuxtLink to="/dashboard">
        <li :class="{active: route.name === 'dashboard'}">
          <Icon name="zondicons:dashboard" />
          <span>{{$t('sidebar.Dashboard')}}</span>
        </li>
      </NuxtLink>
      <div v-if="storeId">
        <NuxtLink to="/inventory">
          <li :class="{active: route.name === 'inventory'}">
            <Icon name="gravity-ui:boxes-3" />
            <span>{{$t('sidebar.Inventory')}}</span>
          </li>
        </NuxtLink>
        <NuxtLink v-if="permissions?.view_log" to="/logs">
          <li class="sidebar-item" index="3" :class="{active: route.name === 'logs'}">
            <Icon name="mingcute:inventory-line" />
            <span>{{$t('sidebar.Logs')}}</span>
          </li>
        </NuxtLink>
        <NuxtLink v-if="isBossAccount" to="/workers">
          <li class="sidebar-item" index="4" :class="{active: route.name === 'workers'}">
            <Icon name="gravity-ui:person-worker" />
            <span>{{$t('sidebar.Workers')}}</span>
          </li>
        </NuxtLink>
        <NuxtLink v-if="permissions?.make_transactions" to="/cashier">
          <li class="sidebar-item" index="5" :class="{active: route.name === 'cashier'}">
            <Icon name="streamline:money-cashier-shop-shopping-pay-payment-cashier-store-cash-register-machine" />
            <span>{{$t('sidebar.Cashier')}}</span>
          </li>
        </NuxtLink>
        <NuxtLink v-if="permissions?.make_transactions" to="/layaway">
          <li class="sidebar-item" index="6" :class="{active: route.name === 'layaway'}">
            <Icon name="tabler:shopping-cart-pause" />
            <span>{{$t('sidebar.Layaway')}}</span>
          </li>
        </NuxtLink>
        <NuxtLink v-if="permissions?.make_transactions" to="/transactions">
          <li class="sidebar-item" index="7" :class="{active: route.name === 'transactions'}">
            <Icon name="uil:transaction" />
            <span>{{$t('sidebar.Transactions')}}</span>
          </li>
        </NuxtLink>
        <NuxtLink to="/offline">
          <li class="sidebar-item" index="8" :class="{active: route.name === 'offline'}">
            <Icon name="oui:offline" class="text-red-500" />
            <span>{{$t('sidebar.Offline')}}</span>
          </li>
        </NuxtLink>
        <NuxtLink v-if="store.id !== storeId && isBossAccount" to="/dashboard" @click="exitStore()">
          <li class="sidebar-item" index="9">
            <Icon name="tabler:door-exit" class="text-red-500" />
            <span>{{$t('sidebar.Exit Store')}}</span>
          </li>
        </NuxtLink>
      </div>
    </ul>

    <li class="list-none mt-auto">
      <el-dropdown placement="top-start" trigger="click">
        <div class="el-menu-tooltip__trigger">
          <Icon name="mi:user" />
        </div>
        <template #dropdown>
          <el-dropdown-menu class="text-base">
            <div class="pt-1 pb-1 px-4 w-40">{{$t('sidebar.My Account')}}</div>

            <NuxtLink to="/settings">
              <el-dropdown-item class="flex item-center" divided>
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="icon mr-2" width="1.2em" height="1.2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065"></path><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"></path></g></svg>
                <span>{{$t('sidebar.Settings')}}</span>
              </el-dropdown-item>
            </NuxtLink>

            <el-dropdown-item class="flex item-center" divided @click="logoutUser()">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="icon mr-2 text-red-500" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M3 5c0-1.1.9-2 2-2h8v2H5v14h8v2H5c-1.1 0-2-.9-2-2zm14.176 6L14.64 8.464l1.414-1.414l4.95 4.95l-4.95 4.95l-1.414-1.414L17.176 13H10.59v-2z"></path></svg>
              <span>{{$t('sidebar.Logout')}}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </li>
  </nav>
</template>

<script setup>
//Imports
const store = useStore()
const offlineStore = useOfflineStore()
const { isBoss, getPermissions } = useChecks()
const { sendFrontendNotification } = useHelpers()
const { logout } = useAuth()
const route = useRoute()

//Data
const storeId = computed(() => store.store)
const offlineRequests = computed(offlineStore.fetchPostRequests)
const isBossAccount = computed(isBoss)
const permissions = ref({make_transactions: true, view_log: true})
const isExpanded = ref(true)

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
    sendFrontendNotification('You exited the store!', 'success')
  }
}

async function logoutUser() {
  store.exitStore()
  await logout()
}
</script>

<style lang="scss" scoped>
nav {
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 2;
  background: #111;
  display: flex;
  flex-direction: column;
  border-color: #2D2D2D;
  transition: 200ms ease-in-out;
  width: 180px;
  overflow: hidden;
  &.close {
    padding: 5px;
    width: 60px;
    header {
      span {
        position: absolute;
        visibility: hidden;
        transition: visibility 0s 150ms;
      }
      #sidebar-toggle {
        left: -3px;
        svg {
          transform: rotate(180deg);
          transition: transform 0s 200ms;
        }
      }
    }
    ul {
      li {
        position: relative;
        width: 44px;
        border-radius: 12px;
        margin: 2px auto;
        padding: 0 14px;
        span {
          position: absolute;
          left: 40px;
          visibility: hidden;
          transition: visibility 0s 200ms;
        }
      }
    }
  }
  header {
    display: flex;
    align-items: center;
    padding: 16px 16px;
    user-select: none;
    #sidebar-toggle {
      height: 28px;
      position: relative;
      transition: 200ms ease-in-out;
      margin-left: auto;
      cursor: pointer;
      border-radius: 6px;
      padding: 0 4px;
      &:hover {
        background: #ffffff14;
      }
    }
  }
  ul {
    padding: 8px 0;
    a {
      li {
        display: flex;
        align-items: center;
        white-space: nowrap;
        gap: 8px;
        height: 44px;
        padding: 0 16px;
        transition: all 200ms ease-in-out;
        width: 100%;
        font-size: 15px;
        &.active, &:hover {
          background: #ffffff14;
        }
        svg {
          font-size: 16px;
          min-width: 16px;
        }
        
      }
    }
  }
}

.el-dropdown {
  width: 100%;
  .el-tooltip__trigger {
    display: flex;
    align-items: center;
    white-space: nowrap;
    gap: 8px;
    height: 44px;
    transition: all 200ms ease-in-out;
    width: 44px;
    border-radius: 12px;
    margin: 0 auto;
    padding: 0 14px;
    &:hover {
      background: #ffffff14;
    }
    svg {
      font-size: 16px;
      min-width: 16px;
    }
  }
}
</style>