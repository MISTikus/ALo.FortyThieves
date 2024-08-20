<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
    style?: string,
}>()
const style = computed(() => (props.style || ""))
</script>

<template>
    <div class="card slot" :style="style" ></div>
</template>

<style scoped>
.slot {
    border: 2px solid gray;
    border-radius: 8px;
}
</style>