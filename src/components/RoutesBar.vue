<script setup lang="ts">
import CardsPlayingOutline from 'vue-material-design-icons/CardsPlayingOutline.vue'
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue'
import Cogs from 'vue-material-design-icons/Cogs.vue'
import 'vue-material-design-icons/styles.css';
</script>

<template>
    <div class="routes-bar">
        <RouterLink to="/newgame">
            <CardsPlayingOutline class="icon-2x" />
        </RouterLink>
        <RouterLink to="/settings">
            <Cogs class="icon-2x" />
        </RouterLink>
        <RouterLink to="/about">
            <InformationOutline class="icon-2x" />
        </RouterLink>
    </div>
</template>

<style>
.material-design-icon.icon-2x {
    width: 36px;
    height: 36px;
}

.material-design-icon.icon-2x>.material-design-icon__svg {
    height: 36px;
    width: 36px;
    bottom: -2px;
}
</style>

<style scoped>
.routes-bar {
    display: flex;
    flex-direction: row;
    gap: var(--default-gap);
    margin: 0 1rem;
}
</style>