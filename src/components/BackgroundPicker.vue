<script setup>

const props = defineProps(["backgrounds"])

const emit = defineEmits(["close","selected"])

</script>

<template>
<div class="background-picker-overlay">
    <div>Backgrounds</div>
    <div class="background-picker-grid">
        <template v-for="bg,i in backgrounds" key="i" class="picker-tile">
            <a @click="emit('selected',bg)">
                <div>{{ bg.name }}</div>
                <img :src="bg.url" class="picker-tile__image">
            </a>
        </template>
    </div>
    <button @click="emit('close')">Close</button>
</div>

</template>

<style>

.picker-tile {
    display:inline-block;
    border: white;
}


.picker-tile__image {
    max-height : 192px;
    max-width : 256px;
    min-height: 96px;
    min-width: 128px;
}

.background-picker-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    z-index: 2;
    background-color: var(--color-md-textbox-bg);
}

.background-picker-grid {
    border: 1px solid var(--color-border);
    display: grid;
    gap: 1px;
    grid-template-columns: repeat(auto-fit, minmax(min(8rem, 100%), 1fr));
}

</style>