<script setup>
import { defineProps, ref } from 'vue';
import AnimatedPkmnSprite from './AnimatedPkmnSprite.vue'
import {pkmnFactory} from '../pkmn.js'
import PkmnPortrait from './PkmnPortrait.vue';
import EmotionPicker from './EmotionPicker.vue'
import AnimationPicker from './AnimationPicker.vue';

const props = defineProps(["background"])


const placedPkmn = ref(new Map())

const pickerPkmnUid = ref(0)
const pickerType = ref("")
const pickerPosition = ref([0,0])

const teamName = ref("")

const teamCard = ref(null)

function dragoverHandler(event){
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy'
}

function dragLeaveHandler(event){
    event.preventDefault();
	event.dataTransfer.dropEffect = 'none'
}

function dropHandler(event){
    console.log(event.dataTransfer.getData("pkmn"))
    const rootRect = teamCard.value.getBoundingClientRect()
    const pkmnData = event.dataTransfer.getData("pkmn")
    const rectData = event.dataTransfer.getData("rect")
    if (pkmnData.length > 0){
        const newPkmn = JSON.parse(pkmnData)
        if (rectData.length > 0){
            const rect = JSON.parse(rectData)
            newPkmn.positionX = event.pageX - rect.width/2 - rootRect.left
            newPkmn.positionY = event.pageY - rect.height/2 - rootRect.top - window.scrollY
        } else {
            newPkmn.positionX = event.pageX - rootRect.left
            newPkmn.positionY = event.pageY - rootRect.top - window.scrollY
        }
        placedPkmn.value.set(newPkmn.uid, newPkmn)
    }
}

function dragStart(event, uid){
    const movedPkmn = placedPkmn.value.get(uid)
    event.dataTransfer.dropEffect = 'move'
    //const dragImage = event.target.getElementsByClassName('sprite-container')[0]
    //event.dataTransfer.setDragImage(dragImage, 0, -movedPkmn.animationTileY)
    event.dataTransfer.setData('pkmn', JSON.stringify(movedPkmn))
    event.dataTransfer.setData('rect', JSON.stringify(event.target.getBoundingClientRect()))
}

function dragEnd(event) {
    const pkmnData = event.dataTransfer.getData("pkmn")
    if (pkmnData != null && event.dataTransfer.dropEffect == "none"){
        const uid = JSON.parse(pkmnData).uid
        placedPkmn.value.delete(uid)
    }
}

function onPickEmotion(pickEmotionEvent) {
    const pkmn = placedPkmn.value.get(pickEmotionEvent.pkmnUid)
    if (pkmn){
        pkmn.emotion = pickEmotionEvent.emotion
    }
    closeActivePicker();
}

function closeActivePicker(){
    pickerType.value = ""
}

function openEmotionPicker(event, pkmnUid){
    pickerType.value = "emotion"
    pickerPkmnUid.value = pkmnUid
    const rect = event.target.getBoundingClientRect();
    pickerPosition.value = [rect.left, rect.top]
}

function openSpritePicker(event, pkmnUid){
    pickerType.value ='animation'
    pickerPkmnUid.value = pkmnUid
    //const rect = event.target.getBoundingClientRect();
    pickerPosition.value = [event.pageX+30, event.pageY]
}

function setDirection(pickDirectionEvent){
    const pkmn = placedPkmn.value.get(pickDirectionEvent.pkmnUid)
    if (pkmn){
        pkmn.animationTileY = pickDirectionEvent.direction
    }
}

function setAnimation(pickAnimationEvent){
    const pkmn = placedPkmn.value.get(pickAnimationEvent.pkmnUid)
    if (pkmn){
        pkmn.animation = pickAnimationEvent.animationName
        pkmn.animationTileX = 0
    }
}

function setAnimationFrame(pickAnimationFrameEvent){
    const pkmn = placedPkmn.value.get(pickAnimationFrameEvent.pkmnUid)
    if (pkmn){
        pkmn.animationTileX = pickAnimationFrameEvent.frameIndex
    }
}

function removeTeamMember(uid){
    placedPkmn.value.delete(uid)
}

function toggleShiny(uid){
    const pkmn = placedPkmn.value.get(uid)
    pkmn.shiny = !pkmn.shiny
}

</script>

<template>
    <div ref="teamCard" @dragover="dragoverHandler" @drop="dropHandler" @dragleave="dragLeaveHandler" class="team-card">
        <img :src="background" class="team-card__background">
        <div class="team-card__active-area">
            <template v-for="[uid, pkmn] in placedPkmn" :key="uid">
            <div class="pkmn-sprite" draggable="true" @click="openSpritePicker($event, pkmn.uid)" @dragstart="dragStart($event, pkmn.uid)" @dragend="dragEnd"  :style="{'top': pkmn.positionY+'px', 'left': pkmn.positionX+'px'}">
                <AnimatedPkmnSprite :pkmnId="pkmn.pkmnId" :animation="pkmn.animation" :start="pkmn.animationTileX" :direction="pkmn.animationTileY" :shiny="pkmn.shiny"/>
            </div>
            </template>
            <div class="team-list">
                <div v-for="[uid, pkmn] in placedPkmn" :key="uid" class="team-member">
                    <button @click="openEmotionPicker($event, pkmn.uid)" class="clickable_portrait">
                        <PkmnPortrait :pkmnId="pkmn.pkmnId" :emotion="pkmn.emotion" :shiny="pkmn.shiny"></PkmnPortrait>
                    </button>
                    <input>
                    <i class="icon-shiny team-member__toggle_shiny" @click="toggleShiny(uid)"></i>
                    <i class="icon-xcross team-member__remove" @click="removeTeamMember(uid)"></i>
                </div>
            </div>
            <div class="team-card__info pmd-font">
                <div>Team:</div>
                <input v-model="teamName" class="pmd-font">
            </div>
        </div>
    </div>
    <div v-show="pickerType != ''" @click="closeActivePicker()" class="background-overlay"></div>
    <EmotionPicker v-if="pickerType=='emotion'" @pick-emotion="onPickEmotion" :positionX="pickerPosition[0]" :positionY="pickerPosition[1]" :pkmn="placedPkmn.get(pickerPkmnUid)"></EmotionPicker>
    <AnimationPicker v-if="pickerType=='animation'" @pick-animation="setAnimation" @pick-animation-frame="setAnimationFrame" @pick-direction="setDirection" :positionX="pickerPosition[0]" :positionY="pickerPosition[1]" :pkmn="placedPkmn.get(pickerPkmnUid)"></AnimationPicker>
</template>

<style>

.icon-shiny {
    mask-image: url('../assets/icon/shiny.svg');
    background-color: var(--color-text);
    mask-repeat: no-repeat;
    mask-size: 100% auto;
    display: block;
    height: 1rem;
    width: 1rem;
}

.icon-xcross {
    mask-image: url('../assets/icon/xmark-solid.svg');
    background-color: var(--color-text);
    mask-repeat: no-repeat;
    display: block;
    height: 1rem;
    width: 1rem;
}

.team-card {
    background-repeat: no-repeat;
    background-size: contain;
    position: relative;
    width: 480px;
}

.team-card__background {
    image-rendering: pixelated;
    object-fit: contain;
    width: 100%;
    top: 0%;
    left: 0%;
}

.team-card__active-area {
    position: absolute;
    top: 0%;
    left: 0%;
    width: 100%;
    height: 100%;
}

.team-card__info {
    position: absolute;
    right: 2%;
    top: 2%;
}

.team-card__info input {
    border: none;
    background: rgb(0,0,0,25%);
    font-size: 1.5rem;
} 

.background-overlay{
    position:fixed;
    z-index: 10;
    width: 100vw;
    height: 100vh;
    top: 0;
    left:0;
}

.clickable_portrait {
    border:none;
    background: none;
    margin: 0;
    padding: 0;
}

.team-list {
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    padding: 20px;
    overflow: hidden;
    width: 40%;
}

.team-member {
    position:relative;
    display: flex;
    flex-flow: row nowrap;
    margin-top: 10px;
    margin-bottom: 10px;
}

.team-member input {
    background-color: rgba(0,0,0,33%);
    border: none;
    font-family: PKMN-Mystery-Dungeon;
    color: white;
    font-size: 1.5em;
    min-width: 0;
}

.team-member__remove {
    position: absolute;
    right: 0;
    top: 0;
}

.team-member__toggle_shiny {
    position: absolute;
    right: 1rem;
    top: 0; 
}

.team-member__toggle_shiny:hover {
    background-color: red;
}


.team-member__remove:hover {
    background-color: red;
}



.pkmn-sprite {
    image-rendering: pixelated;
    overflow: hidden;
    position: absolute;
    z-index: 1;
}

</style>