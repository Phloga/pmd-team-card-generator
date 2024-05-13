<script setup>

import { computed, ref } from 'vue';

import {pkmnDataRepository} from '../pkmn.ts'

const props = defineProps({
    "pkmnId" : { type: Number, required:true}, 
    "formId" : { type: String, default: "0000"},
    "emotion" : { type: String, default: "Normal"}, 
    "shiny" : { type: Boolean, default: false }})

const portraitPath = computed(() => {
    return pkmnDataRepository.getPortraitPath(props.pkmnId, props.formId, props.emotion, props.shiny)
})

const portraitSize = ref(pkmnDataRepository.getPortraitSize())

</script>

<template>
    <div ref="spriteContainer" class="sprite-container" :style="
        {width: portraitSize+'px', height: portraitSize+'px'}">
        <img :src="portraitPath" draggable="false"/>
    </div>
</template>

<style>
</style>