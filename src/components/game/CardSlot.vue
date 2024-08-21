<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
    style?: string,
}>()
const style = computed(() => (props.style || ""))
</script>

<template>
    <div class="slot" :style="style"></div>
</template>

<style scoped>
.slot {
    width: var(--card-width);
    height: var(--card-height);
    border: 2px solid gray;
    border-radius: 8px;
}
</style>