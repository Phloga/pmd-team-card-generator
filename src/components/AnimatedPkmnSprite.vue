<script setup>

import { computed, onMounted, ref, watch } from 'vue';

import {pkmnDataRepository} from '../pkmn.ts'

const props = defineProps({
    "pkmnId" : Number, 
    "formId" : {type: String, default: "0000"},
    "shiny" : {type: Boolean, default: false},
    "animation" : String, 
    "direction" : Number, 
    "start" : {type: Number, default:0},
    "pixelSize" : {type: Number, default:1}
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

async function fetchAnimations(pkmnId, formId){
    animations.value = await pkmnDataRepository.fetchAnimData(pkmnId,formId)
}

watch(() => props.pkmnId, async (newPkmnId, oldPkmnId) => {
    fetchAnimations(newPkmnId, props.formId)
})

watch(() => props.formId, async (newFormId, oldFormId) => {
    fetchAnimations(props.pkmnId, newFormId)
})


onMounted(() => {
    if (pkmnDataRepository.hasAnimData(props.pkmnId)){
        animations.value = pkmnDataRepository.getAnimData(props.pkmnId)
    } else {
        intersectionObserver = new IntersectionObserver((entries) => {
            if (entries[0].intersectionRatio <= 0) return;
            fetchAnimations(props.pkmnId, props.formId)
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
            width: pixelSize*activeAnimation.frameWidth+'px', 
            height: pixelSize*activeAnimation.frameHeight+'px',
        }">
        <img loading="lazy" ref="sprite" class="sprite" :src="activeAnimation.file" draggable="false" :style="{
            transform: 'scale(' + pixelSize +') ' + 'translate(' + -start*activeAnimation.frameWidth+'px,' + -direction *activeAnimation.frameHeight+'px)'
        }"/>
    </div>
</template>

<style>

    .sprite {
        image-rendering: pixelated;
        transform-origin:top left;
    }

    .sprite-container {
        overflow: hidden;
    }
</style>