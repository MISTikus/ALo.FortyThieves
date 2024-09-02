<script setup lang="ts">
import { RouterView } from 'vue-router'
import StatusBar from '@/components/StatusBar.vue'
import router from '@/router'
</script>

<template>
  <header>
    <StatusBar :timerEnabled="router.currentRoute.value.name === 'game'" />
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
  align-items: center;
  gap: calc(var(--default-gap) / 4);
  width: 100%;
  height: 40px;
  padding: 0 var(--default-padding);
  background-color: #cbcbfb99;
}
</style>
