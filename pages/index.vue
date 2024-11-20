<template>
  <div style="text-align: center; padding: 40px 0;">
    <h1>Landing Page</h1>
    
    Inventory Systems can be complex. <br>
    Lets make it simple. <br><br><br>
    <div>
      <el-link :underline="false" href="/login" type="primary">
        Login
      </el-link>

      <br><br><br>

      <el-link :underline="false" href="/register" type="primary">
        Register
      </el-link>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'temp'
})
</script>