<template>
  <aside class="docs-sidebar">
    <div class="sidebar-header">
      <NuxtLink to="/" class="logo">
        <span class="logo-text">Legitski</span>
      </NuxtLink>
      <span class="docs-badge">API Docs</span>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink
        to="/docs"
        class="nav-item"
        :class="{ active: activePath === '/docs' }"
      >
        <Icon name="mdi:rocket-launch" />
        <span>Getting Started</span>
      </NuxtLink>

      <div class="nav-section">
        <div class="nav-section-title">Endpoints</div>

        <NuxtLink
          to="/docs/store/stores"
          class="nav-item"
          :class="{ active: activePath === '/docs/store/stores' }"
        >
          <Icon name="mdi:store" />
          <span>Store</span>
        </NuxtLink>

        <NuxtLink
          to="/docs/inventory"
          class="nav-item"
          :class="{ active: activePath === '/docs/inventory' }"
        >
          <Icon name="mdi:package-variant" />
          <span>Inventory</span>
        </NuxtLink>

        <NuxtLink
          to="/docs/transactions"
          class="nav-item"
          :class="{ active: activePath === '/docs/transactions' }"
        >
          <Icon name="mdi:receipt" />
          <span>Transactions</span>
        </NuxtLink>

        <NuxtLink
          to="/docs/layaways"
          class="nav-item"
          :class="{ active: activePath === '/docs/layaways' }"
        >
          <Icon name="mdi:clock-outline" />
          <span>Layaways</span>
        </NuxtLink>

        <NuxtLink
          to="/docs/customers"
          class="nav-item"
          :class="{ active: activePath === '/docs/customers' }"
        >
          <Icon name="mdi:account-group" />
          <span>Customers</span>
        </NuxtLink>

        <NuxtLink
          to="/docs/logs"
          class="nav-item"
          :class="{ active: activePath === '/docs/logs' }"
        >
          <Icon name="mdi:history" />
          <span>Logs</span>
        </NuxtLink>
      </div>
    </nav>
  </aside>
</template>

<script setup>
const props = defineProps({
  activePath: {
    type: String,
    default: '/docs'
  }
})
</script>

<style lang="scss" scoped>
.docs-sidebar {
  width: 260px;
  min-width: 260px;
  background: #12121a;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  text-decoration: none;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.docs-badge {
  font-size: 11px;
  padding: 3px 8px;
  background: rgba(64, 158, 255, 0.15);
  color: #409EFF;
  border-radius: 4px;
  font-weight: 500;
}

.sidebar-nav {
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  margin-bottom: 4px;

  &:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }

  &.active {
    background: rgba(64, 158, 255, 0.15);
    color: #409EFF;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.nav-section {
  margin-top: 20px;
}

.nav-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.4);
  padding: 0 12px;
  margin-bottom: 8px;
  font-weight: 600;
}

.coming-soon {
  margin-left: auto;
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  color: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .docs-sidebar {
    width: 200px;
    min-width: 200px;
  }
}
</style>
