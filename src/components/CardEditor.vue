<script setup>

import {ref, computed} from 'vue'

import SearchablePkmnGrid from './SearchablePkmnGrid.vue'
import TeamCard from './TeamCard.vue'


import PMDSkyStartURL from '../assets/card-backgrounds/PMD Sky Start.png'

import {pkmnDataRepository} from '../pkmn.js'


const pkmnIds = computed(() => {
    return pkmnDataRepository.pkmnIds()
})

const pkmnSearchString = ref("")

const selectedPkmn = ref([])

const backgrounds = ref([
        {
            "url" : PMDSkyStartURL,
            "name" : "PMD Sky Start",
            "style" : "pixelart"
        }
    ])

const selectedBackground = ref(backgrounds.value[0])

</script>


<template>
    <div class="app-root">
        <TeamCard :background="selectedBackground.url"></TeamCard>
        <div class="accordeon pallete_panel">
            <div class="accordeon__header">
                <button class="no-background">
                <i class="icon-accordeon"></i>   
                </button>
            </div>
            <div class="accordeon__body">
                <SearchablePkmnGrid :pkmnList="pkmnIds" v-model="pkmnSearchString"></SearchablePkmnGrid>
            </div>
        </div>
    </div>
</template>

<style>

    .app-root {
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-around;
        align-items: center;
    }

    .pallete_panel {
        background-color: var(--color-md-textbox-bg);
        border-width: 0.5rem;
        border-style: groove ridge ridge groove;
        border-color: var(--color-md-textbox-i1);
        outline: var(--color-md-textbox-o1) solid 0.25rem;
        border-radius: 0.5rem;
        margin: 0.25rem;
        width: 60rem;
    }

    .accordeon {
        display: block;
    }

    .accordeon .accordeon__header{
        display: flex;
        flex-flow: row nowrap;
    }

    .accordeon .accordeon__body{
        display: none;
        height: 16rem;
        overflow-y: scroll;
    }

    .accordeon.accordeon--open .accordeon__body{
        display: block;
    }

    .icon-accordeon {
        mask-image: url('../assets/icon/angle-down-solid.svg');
        background-color: var(--color-text);
        mask-repeat: no-repeat;
        display: block;
        height: 1rem;
        width: 1rem;
    }

    
    .accordeon--open .icon-accordeon {
        mask-image: url('../assets/icon/angle-up-solid.svg');
        display: block;
    }

    .no-background {
        background: none;
        border: none;
    }

</style>