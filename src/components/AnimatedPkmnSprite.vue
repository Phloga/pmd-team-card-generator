<script setup>

import { computed, onMounted, ref, watch } from 'vue';

import {pkmnDataRepository} from '../pkmn.ts'

const props = defineProps({
    "pkmnId" : Number, 
    "shiny" : {type: Boolean, default: false},
    "animation" : String, 
    "direction" : Number, 
    "start" : {type: Number, default:0}
})

let intersectionObserver = null

const animations = ref(new Map())

const activeAnimation = computed(() => {
    if (animations.value.has(props.animation)){
        return animations.value.get(props.animation)
    } else {
        return {
            file: "",
            frameHeight: 0,
            frameWidth: 0,
            copyOf : ""
        }
    }
})

const sprite = ref(null)
const spriteContainer = ref(null)

async function fetchAnimations(pkmnId, shiny){
    animations.value = await pkmnDataRepository.fetchAnimData(pkmnId,shiny)
}

watch(() => props.pkmnId, async (newPkmnId, oldPkmnId) => {
    fetchAnimations(newPkmnId, props.shiny)
})

watch(() => props.shiny, async (newShiny, oldShiny) => {
    fetchAnimations(props.pkmnId, newShiny)
})


onMounted(() => {
    if (pkmnDataRepository.hasAnimData(props.pkmnId)){
        animations.value = pkmnDataRepository.getAnimData(props.pkmnId)
    } else {
        intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0].intersectionRatio <= 0) return;
            fetchAnimations(props.pkmnId)
            intersectionObserver.unobserve(entries[0].target);
            intersectionObserver = null
        });
        intersectionObserver.observe(spriteContainer.value)
    }
})


</script>

<template>
    <div ref="spriteContainer" class="sprite-container" :style="
        {
            width: activeAnimation.frameWidth+'px', 
            height: activeAnimation.frameHeight+'px'
        }">
        <img loading="lazy" ref="sprite" class="sprite" :src="activeAnimation.file" draggable="false" :style="{
            transform: 'translate3d(' + -start*activeAnimation.frameWidth+'px,' + -direction * activeAnimation.frameHeight+'px,0)'
        }"/>
    </div>
</template>

<style>
    .sprite-container {
        overflow: hidden;
    }
</style>