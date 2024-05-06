<script setup>
const props = defineProps({'name': String, 'image': String})

</script>

<template>
<div class="team-rank-box">
    <img :src="image">
    <div class="pmd-font"> {{ name }}</div>
</div>
</template>

<style>
.team-rank-box {
    background: var(--color-md-infobox-bg);
    display: flex;
    flex-flow: column nowrap;
}

.team-rank-box img {
    image-rendering: pixelated;
}

</style>