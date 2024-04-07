<script setup>

import { computed, onMounted, ref, watch } from 'vue';

import {pkmnDataRepository} from '../pkmn.js'

const props = defineProps({"pkmnId" : Number, "animation" : String, "direction" : Number})

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


const animations = ref(new Map())

const sprite = ref(null)
const spriteContainer = ref(null)

async function fetchAnimations(pkmnId){
    animations.value = await pkmnDataRepository.fetchAnimData(pkmnId)
}

watch(() => props.pkmnId, async (newPkmnId, oldPkmnId) => {
    console.log("updated pkmnid")
    fetchAnimations(newPkmnId)
})

onMounted(() => {
    fetchAnimations(props.pkmnId)
})



</script>

<template>
    <div ref="spriteContainer" class="sprite-container" :style="
        {
            width: activeAnimation.frameWidth+'px', 
            height: activeAnimation.frameHeight+'px'
        }">
        <img loading="lazy" ref="sprite" class="sprite" :src="activeAnimation.file" draggable="false" :style="{
            transform: 'translate3d(0,' + -direction * activeAnimation.frameHeight+'px' + ',0)'
        }"/>
    </div>
</template>

<style>
    .sprite-container {
        overflow: hidden;
    }
</style>