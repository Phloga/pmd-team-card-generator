<script setup>

import {ref, computed, onMounted} from 'vue'

import SearchablePkmnGrid from './SearchablePkmnGrid.vue'
import TeamCard from './TeamCard.vue'
import BackgroundPicker from './BackgroundPicker.vue';

import * as htmlToImage from 'html-to-image';


import PMDSkyStartURL from '../assets/card-backgrounds/PMD Sky Start.png'
import PMDSkyTitleURL from '../assets/card-backgrounds/PMD Sky Title Screen BG.png'

import {pkmnDataRepository} from '../pkmn'

/*
const pkmnIds = computed(() => {
    return pkmnDataRepository.pkmnIds()
})*/
const pkmnIds = ref(new Array())
onMounted(async () => {
    pkmnIds.value = await pkmnDataRepository.fetchPkmnIds()
})

const pkmnSearchString = ref("")

const backgrounds = ref([
        {
            "url" : PMDSkyStartURL,
            "name" : "PMD Sky Start",
            "style" : "pixelart"
        },
        {
            "url" : PMDSkyTitleURL,
            "name" : "PMD Sky Title Screen",
            "style" : "pixelart"
        }
    ])

const selectedBackground = ref(backgrounds.value[0])

const backgroundPickerVisible = ref(false)

const bgPixelScale = ref(3)

function setBackgroundPickerVisibility(visible){
    backgroundPickerVisible.value = visible
}

function setBackground(bg){
    selectedBackground.value = bg;
    setBackgroundPickerVisibility(false)
}

function generateCardAsPng(event){
    htmlToImage.toBlob(document.getElementById('teamCard')).then(
        function (blob) {
            var blobUrl = URL.createObjectURL(blob);
            var link = document.createElement("a"); // Or maybe get it from the current document
            link.href = blobUrl;
            link.download = "team.png";
            link.innerHTML = "";
            link.click()
        });
}

function addBackground(file){
    const reader = new FileReader()
    reader.onload = function () {
        const tmp = new Image()
        tmp.src = reader.result

        const newBackground = {
            "url" : reader.result,
            "name" : file.name,
            "style" : "pixelart"
        }

        backgrounds.value.push(newBackground)
    }
    reader.readAsDataURL(file)
}

</script>


<template>
    <BackgroundPicker v-show="backgroundPickerVisible" @close="setBackgroundPickerVisibility(false)" @selected="setBackground" @added="addBackground" :backgrounds="backgrounds"></BackgroundPicker>
    <TeamCard :background="selectedBackground.url" :backgroundScale="bgPixelScale"></TeamCard>
    <div class="md-frame">
        <div class="accordeon accordeon--open">
            <div class="accordeon__header">
                <button class="no-background">
                    <i class="icon-accordeon"></i>   
                </button>
                <div class="heading text-right">General</div>
            </div>
            <div class="accordeon__body">
                <button @click="setBackgroundPickerVisibility(true)">Pick Background</button>
                <button @click="generateCardAsPng">Save</button>
                <div class="labeled-field">
                    <div>Background Pixel Scale</div>
                    <input type="number" min="0.1" step="0.1" v-model="bgPixelScale">
                </div>
            </div>
        </div>
        <div class="accordeon">
            <div class="accordeon__header">
                <button class="no-background">
                <i class="icon-accordeon"></i>
                </button>
                <div class="heading text-right">Pokemon</div>
            </div>
            <div class="accordeon__body accordeon__body--scrollable">
                <SearchablePkmnGrid :pkmnList="pkmnIds" v-model="pkmnSearchString"></SearchablePkmnGrid>
            </div>
        </div>
    </div>
</template>

<style>

    .md-frame {
        background-color: var(--color-md-textbox-bg);
        border-width: 0.5rem;
        border-style: groove ridge ridge groove;
        border-color: var(--color-md-textbox-i1);
        outline: var(--color-md-textbox-o1) solid 0.25rem;
        border-radius: 0.5rem;
        min-width: 16rem;
        max-width: 28rem;
    }

    .accordeon {
        display: block;
    }

    .accordeon .accordeon__header{
        display: flex;
        flex-flow: row nowrap;
        border: 2px solid var(--color-md-textbox-bg);
        outline-offset: -2px;
    }

    .accordeon .accordeon__body{
        display: none;
    }

    .accordeon.accordeon--open .accordeon__body{
        display: block;
    }

    .accordeon__body--scrollable {
        height: 16rem;
        overflow-y: scroll;
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

    button {
        color: var(--color-text);
        border: 1px solid var(--color-border);
        background-color: var(--color-button-bg);
    }

    button:hover {
        background-color: var(--color-button-bg-hover);
    }

    button:active{
        background-color: var(--color-button-bg-active);
    }

    .labeled-field {
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-start;
    }

    .labeled-field input {
        color: var(--color-text);
        background: var(--color-md-textbox-bg);
        border: none;
        font-size: 1rem;
        margin-left: 1rem;
    }

    .no-background {
        background: none;
        border: none;
    }

</style>