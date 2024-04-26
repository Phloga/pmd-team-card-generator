<script setup>
import DirectionPicker from './DirectionPicker.vue'
import AnimatedPkmnSprite from './AnimatedPkmnSprite.vue';

import {pkmnDataRepository} from '../pkmn.ts'

import {watch, ref} from 'vue'
import { onMounted } from 'vue';

const props = defineProps(["pkmn","positionY", "positionX"])

const emit = defineEmits(["pickDirection","pickAnimation", "pickAnimationFrame"])

const frameNumInput = ref(null)

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
    frameNumInput.value.value = "0"
}

function setAnimationFrame(event, pkmnUid){
    let frameNum = parseInt(event.target.value)
    const activeAnimation = animations.value.get(props.pkmn.animation)
    if (activeAnimation.durations.length <= frameNum) {
        frameNum = 0
        event.target.value = "0"
    } else if ( frameNum < 0){
        frameNum = activeAnimation.durations.length-1
        event.target.value = toString(frameNum)
    }

    emit("pickAnimationFrame", {
        pkmnUid: pkmnUid,
        frameIndex: frameNum
    })
}

</script>


<template>
    <div class="animation-picker" :style="{'top': positionY+'px', 'left': positionX+'px'}">
        <div class="translucent-panel">
            <div>Direction</div>
            <DirectionPicker @pick-direction="pickDirection"></DirectionPicker>
        </div>
        <div class="translucent-panel">
            <div>Pose: [{{ pkmn.animation }}#{{ pkmn.animationTileX }}]</div>
        </div>

        <div class="animation-dropdown translucent-panel">
            <div v-for="[name, _anim] in animations" :key="name" @click="onClick($event, name)" class="animation-tile">
                <AnimatedPkmnSprite :pkmnId="pkmn.pkmnId" :animation="name" :direction="0"/>
                <div class="animation-tile__name"> {{ name }}</div>
            </div>
        </div>
        <input ref="frameNumInput" class="frame-input" type="number" @input="setAnimationFrame($event, pkmn.uid)" :value="pkmn.animationTileX">
    </div>
</template>

<style>

.translucent-panel{
    background-color: rgba(0,0,0,35%);
    padding-bottom: 0.5rem;
}

.animation-tile {
    position:relative;
    border: 1px solid rgb(255,255,255);
    margin-top: 1px;
}

.animation-tile__name {
    position: absolute;
    bottom: 0;
    right: 0.1rem;
}


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