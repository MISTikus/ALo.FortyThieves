<script setup lang="ts">
import { RouterView } from 'vue-router'
import StatusBar from '@/components/StatusBar.vue'
</script>

<template>
  <header>
    <StatusBar />
  </header>
  <div class="content">
    <RouterView />
  </div>
</template>

<style scoped>
header {
  display: flex;
  flex-direction: row;
  justify-content: end;
  gap: var(--default-gap);
  width: 100%;
  padding: var(--default-padding);
  background-color: #cbcbfb99;
}
</style>
