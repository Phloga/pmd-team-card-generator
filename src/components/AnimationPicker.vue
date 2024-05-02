<script setup>
import DirectionPicker from './DirectionPicker.vue'
import AnimatedPkmnSprite from './AnimatedPkmnSprite.vue';

import {pkmnDataRepository} from '../pkmn.ts'

import {watch, ref} from 'vue'
import { onMounted } from 'vue';

const props = defineProps(["pkmn","positionY", "positionX"])

const emit = defineEmits(["pickDirection","pickAnimation", "pickAnimationFrame", "setScale"])

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

function changeAnimationFrame(pkmnUid, delta){
    let frameNum = props.pkmn.animationTileX + delta
    const activeAnimation = animations.value.get(props.pkmn.animation)
    if (activeAnimation.durations.length <= frameNum) {
        frameNum = 0
    } else if ( frameNum < 0){
        frameNum = activeAnimation.durations.length-1
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
            <div class="frame-selection">
                <button @click="changeAnimationFrame(pkmn.uid, -1)">
                    <i class="icon-angle-down-solid" :style="{
                        'transform': 'rotate(90deg)'
                    }"></i>
                </button>
                <div>Pose:</div>
                <div>[{{ pkmn.animation }}#{{ pkmn.animationTileX }}]</div>
                <button @click="changeAnimationFrame(pkmn.uid, 1)">
                    <i class="icon-angle-up-solid" :style="{
                        'transform': 'rotate(90deg)'
                    }"></i>
                </button>
            </div>
        </div>

        <div class="animation-dropdown translucent-panel">
            <div v-for="[name, _anim] in animations" :key="name" @click="onClick($event, name)" class="animation-tile">
                <AnimatedPkmnSprite :pkmnId="pkmn.pkmnId" :animation="name" :direction="0"/>
                <div class="animation-tile__name"> {{ name }}</div>
            </div>
        </div>
    </div>
</template>

<style>

.frame-selection {
    display: flex;
    flex-flow: row nowrap;
    justify-content:center;
    align-items: center;
}

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

.animation-picker input {
    border: none;
    background: rgb(0,0,0,25%);
    color: var(--color-text);
}


.icon-angle-down-solid {
        mask-image: url('../assets/icon/angle-down-solid.svg');
        background-color: var(--color-text);
        mask-repeat: no-repeat;
        display: block;
        height: 1rem;
        width: 1rem;
    }

.icon-angle-up-solid {
        mask-image: url('../assets/icon/angle-up-solid.svg');
        background-color: var(--color-text);
        mask-repeat: no-repeat;
        display: block;
        height: 1rem;
        width: 1rem;
    }

</style>