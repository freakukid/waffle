<template>
  <div>
    <div id="wrapper">
      <NuxtLink to="/inventory">
        <el-button class="btn">
          <div class="btn-body">
            <Icon name="mingcute:inventory-line" />
            <b>{{ $t(`text.go to inventory`) }}</b>
          </div>
        </el-button>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
//Mount
onBeforeMount(async () => {
  
})
//Mount
</script>

<style lang="scss" scoped>
#wrapper {
  min-height: calc(100vh - 172px);
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 32px;
}

.btn {
  height: 300px;
  width: 300px;
  background: #1c1c1c;
  color: #d3d3d3;
  transition: all 200ms ease-in-out;
  &:hover {
    color: #fff;
  }
  .btn-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    font-size: 20px;
    svg {
      font-size: 120px;
    }
  }
}
</style>