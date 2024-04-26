<script setup>
import {pkmnDataRepository} from '../pkmn.ts'
import {ref} from 'vue'

const props = defineProps(["pkmn", "positionY", "positionX"])
const emit = defineEmits(["pickEmotion"])

const emotions = ref(pkmnDataRepository.getPortraitEmotions())


function pickEmotion(event, pkmnUid, emotion){
    emit("pickEmotion", {
        emotion: emotion,
        pkmnUid: pkmnUid
    })
}

</script>


<template>
    <div class="dropdown" :style="{'top': positionY+'px', 'left': positionX+'px'}">
        <div v-for="emo,i in emotions" class="dropdown__entry" :key="i">
            <img :src="pkmnDataRepository.getPortraitPath(props.pkmn.pkmnId, emo, props.pkmn.shiny)" @click="pickEmotion($event, props.pkmn.uid, emo)">
            <div>{{emo}}</div>
        </div>
    </div>
</template>

<style>
.dropdown{
    display: block;
    position: absolute;
    overflow-y: scroll;
    max-height: 100vh;
    height: 16rem;
    background: rgb(112, 204, 227);
    z-index: 11;
}

.dropdown__entry {
    display: flex;
    flex-flow: row nowrap;
}

</style>