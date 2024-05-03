<script setup>

const props = defineProps(["backgrounds"])

const emit = defineEmits(["close","selected","added"])


function addBackgrounds(event) {
    for (const file of event.target.files) {
        emit("added", file)
    }
}

</script>

<template>
<div class="background-picker-overlay">
    <div>Backgrounds</div>
    <div class="background-picker-grid">
        <template v-for="bg,i in backgrounds" key="i">
            <a @click="emit('selected',bg)" class="picker-tile">
                <div>{{ bg.name }}</div>
                <img :src="bg.url" class="picker-tile__image">
            </a>
        </template>
    </div>
    
    <label for="background-input" class="add-background-button">
        <input type="file" id="background-input" multiple @change="addBackgrounds"/>
        <div class="control-button">Load Images</div>
    </label>

    <button @click="emit('close')" class="control-button">Close</button>
</div>

</template>

<style>

.add-background-button input{
    display: none;
}

.picker-tile {
    display:inline-block;
    border: solid 1px var(--color-border);
    margin: 1px;
}


.picker-tile__image {
    max-height : 192px;
    max-width : 256px;
    /*min-height: 96px;
    min-width: 128px;*/
}

.background-picker-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    padding: 2rem;
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