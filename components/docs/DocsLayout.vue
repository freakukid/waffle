<template>
  <div class="docs-layout">
    <DocsSidebar :active-path="activePath" />
    <main class="docs-content">
      <slot />
    </main>
  </div>
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
.docs-layout {
  display: flex;
  min-height: 100vh;
  background: #0a0a0f;
}

.docs-content {
  flex: 1;
  padding: 40px 60px;
  max-width: 900px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .docs-content {
    padding: 20px;
  }
}
</style>
