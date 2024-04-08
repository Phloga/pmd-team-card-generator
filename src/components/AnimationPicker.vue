<script setup>
import DirectionPicker from './DirectionPicker.vue'
import AnimatedPkmnSprite from './AnimatedPkmnSprite.vue';

import {pkmnDataRepository} from '../pkmn.js'

import {watch, ref} from 'vue'
import { onMounted } from 'vue';

const props = defineProps(["pkmn","positionY", "positionX"])

const emit = defineEmits(["pickDirection","pickAnimation", "pickAnimationFrame"])

function pickDirection(dir) {
    console.log("pickDirection")
    emit("pickDirection", 
        {
            direction: dir,
            pkmnUid: props.pkmn.uid
        }
    )
}

const animations = ref(new Map())

watch(() => props.pkmn, async () => {
    animations.value = await pkmnDataRepository.fetchAnimData(props.pkmn.pkmnId)
})

onMounted(async () => {
    animations.value = await pkmnDataRepository.fetchAnimData(props.pkmn.pkmnId)
})

function onClick(event, animationName){
    emit("pickAnimation", {
        animationName : animationName,
        pkmnUid: props.pkmn.uid
    })
}

</script>


<template>
    <div class="animation-picker" :style="{'top': positionY+'px', 'left': positionX+'px'}">
        <div>Direction</div>
        <DirectionPicker @pick-direction="pickDirection"></DirectionPicker>
        <div>Pose</div>
        <div class="animation-dropdown">
            <div v-for="[name, anim] in animations" :key="name" @click="onClick($event, name)">
                <AnimatedPkmnSprite :pkmnId="pkmn.pkmnId" :animation="name" :direction="0"/>
                <div> {{ name }}</div>
            </div>
        </div>
        <input class="frame-input" type="number">
    </div>
</template>

<style>

.animation-dropdown {
    display: flex;
    flex-flow: column nowrap;
    justify-items: center;
    overflow-y: scroll;
    max-height: 7rem;
}

.animation-picker {
    display: block; /*change to grid */
    position: absolute;
    background: none;
    z-index: 11;
}

</style>