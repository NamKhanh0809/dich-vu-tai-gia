<template>
  <div class="layout-container">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'MainLayout',
}
</script>

<style scoped>
.layout-container {
  min-height: calc(100vh - 64px);
  background-color: #f9fafb;
}
</style>
