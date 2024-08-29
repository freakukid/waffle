<template>
  <h1>Landing Page</h1>

  Are Inventory Systems too complex
  Why can't Inventory systems be simple

  
</template>

<script setup>
definePageMeta({
  layout: "auth",
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard',
  }
})
</script>