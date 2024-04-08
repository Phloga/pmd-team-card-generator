<script setup>
import {computed} from 'vue'
import AnimatedPkmnSprite from './AnimatedPkmnSprite.vue'
import {pkmnFactory} from '../pkmn.js'


const props = defineProps(["pkmnList","modelValue"])
import {useI18n} from "vue-i18n";

const { t } = useI18n()

const displayPkmnList = computed(() => {

    return props.pkmnList.map(pkmnId => { 
        const name = t("names.pkmn" + pkmnId);
        return {
            id: pkmnId,
            displayName: name,
            searchName: pkmnId + " " + name.toUpperCase()
        }
    })
})

const filteredPkmnSet = computed(() => {
    const newFilteredSet = new Set()
    const listSize = displayPkmnList.value.length
    for (let i = 0;i< listSize; i++){
        if (displayPkmnList.value[i].searchName.indexOf(props.modelValue.toUpperCase()) != -1) {
            newFilteredSet.add(displayPkmnList.value[i].id)
        }
    }
    return newFilteredSet
})


function selectItem(index){
    //let pkmn = filteredPkmnList.value[index]
}

function onDragStartHandler(event, pkmnId){
    const rect = event.target.getBoundingClientRect();
    // delete drag and drop image
    event.dataTransfer.dropEffect = 'copy'
    //event.dataTransfer.setDragImage(new Image(0,0), 0, 0)
    const dragImage = event.target.getElementsByClassName('sprite-container')[0]
    event.dataTransfer.setDragImage(dragImage, 0, 0)
    const data = JSON.stringify(pkmnFactory.makePkmn(pkmnId, "Idle", 0, 0));
    event.dataTransfer.setData("pkmn", data);
}

</script>

<template>
    <input type="text" :value="props.modelValue" @input="$emit('update:modelValue', $event.target.value)" placeholder="search" class="search-field">
    <div ref="grid-root" class="grid-root">       
        <template v-for="pkmn,i in displayPkmnList" :key="i">
            <div v-show="filteredPkmnSet.has(pkmn.id)" @click="selectItem(i)" class="pkmn-card" draggable="true" @dragstart="onDragStartHandler($event, pkmn.id)">
                <div class="pkmn-card__sprite">
                    <AnimatedPkmnSprite :pkmnId="pkmn.id" animation="Idle" :direction="0"/>
                </div>
                <div class="pkmn-card__footer">
                    <div class="pkmn-card__id">{{pkmn.id}}</div>
                    <div class="pkmn-card__name">{{pkmn.displayName}}</div>
                </div>
            </div>
        </template>
    </div>
</template>

<style>
    @keyframes idle-animation {
        from {
            transform: translate3d(0px,0,0);
        }
        to {
            transform: translate3d(100%,0,0);
        }
    }

    .grid-root {
        border: 1px solid var(--color-border);
        display: grid;
        gap: 1px;
        grid-template-columns: repeat(auto-fit, minmax(min(8rem, 100%), 1fr));
    }

    .pkmn-card__footer {
        display: flex;
        flex-flow: row nowrap;
        width: 100%;
        justify-content: space-between;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }

    .pkmn-card__name {
        text-align: right;
    }
    .pkmn-card__sprite {
        display: flex;
        align-items: center;
        justify-content: center;
        image-rendering: pixelated;
        flex-grow: 1;
        /*
        height: 64px;
        width: 64px;
        */
        overflow: hidden;
    }
    .pkmn-card__id {
        text-align: left;
    }

    .pkmn-card {
        display: flex;
        align-items: center;
        flex-flow: column nowrap;
        border: 1px solid var(--color-border);
    }

    .pkmn-dropdown {
    position: absolute;
    z-index: 100;
    border: 1px solid var(--color-border);
    }

    .pkmn-dropdown > button {
    background-color: var(--color-background-item);
    color: var(--color-button-text);
    display: block;
    width: 100%;
    text-decoration: none;
    }

    .pkmn-dropdown > a:hover {
    background-color: var(--color-button-hover);
    display: block;
    }

    .dragged-sprite {
        image-rendering: pixelated;
        overflow: hidden;
        position: absolute;
    }
</style>