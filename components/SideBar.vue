<template>
  <el-menu default-active="2" id="sidebar" :collapse="true">
    <NuxtLink to="/boss/inventory">
      <el-menu-item class="sidebar-item" index="1">
        <Icon name="gravity-ui:boxes-3" />
        <template #title>Inventory</template>
      </el-menu-item>
    </NuxtLink>
    <NuxtLink to="/boss/workers">
      <el-menu-item class="sidebar-item" index="2">
        <Icon name="gravity-ui:person-worker" />
        <template #title>Workers</template>
      </el-menu-item>
    </NuxtLink>
    <NuxtLink to="/boss/cashier">
      <el-menu-item class="sidebar-item" index="3">
        <Icon name="streamline:money-cashier-shop-shopping-pay-payment-cashier-store-cash-register-machine" />
        <template #title>Cashier</template>
      </el-menu-item>
    </NuxtLink>
    <NuxtLink to="/transactions">
      <el-menu-item class="sidebar-item" index="4">
        <Icon name="uil:transaction" />
        <template #title>Transactions</template>
      </el-menu-item>
    </NuxtLink>
    <NuxtLink to="/logs">
      <el-menu-item class="sidebar-item" index="5">
        <Icon name="mingcute:inventory-line" />
        <template #title>Logs</template>
      </el-menu-item>
    </NuxtLink>
    <NuxtLink v-if="store.id != storeId" to="/dashboard" @click="exitStore()">
      <el-menu-item class="sidebar-item" index="5">
        <Icon name="tabler:door-exit" style="color: red" />
        <template #title>Exit Store</template>
      </el-menu-item>
    </NuxtLink>
  </el-menu>
</template>

<script setup>
const { notify } = useNotification()
const store = useStore()
const storeId = computed(() => store.store)

function exitStore(name) {
  store.exitStore()
  notify({ title: 'Success', text: 'You exited a store', type: 'success'})
}
</script>

<style lang="scss">

</style>

<style lang="scss" scoped>
#sidebar {
  border-top: solid 1px var(--el-menu-border-color);
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  border-bottom: solid 1px var(--el-menu-border-color);
  .sidebar-item {
    font-size: 24px;
    &.is-disabled {
      color: #ffffff;
    }
  }
}
</style>