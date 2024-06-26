<script setup>
import { ref, computed, reactive, watch } from 'vue';
import AnimatedPkmnSprite from './AnimatedPkmnSprite.vue'
import PkmnPortrait from './PkmnPortrait.vue';
import EmotionPicker from './EmotionPicker.vue'
import AnimationPicker from './AnimationPicker.vue';
import TeamRank from './TeamRank.vue';
import RankPicker from './RankPicker.vue';
import FormPicker from './FormPicker.vue';
import SpriteInfoBox from './SpriteInfoBox.vue';
import {teamRanks} from '../team'
import { pkmnFactory } from '@/pkmn';

const props = defineProps(["background", "backgroundScale"])
const placedPkmn = ref(new Map())

const pickerPkmnUid = ref(0)
const pickerType = ref("")
const pickerPosition = ref([0,0])

const pointerIsOverSprite = ref(false)
const infoBoxPosition = ref([0,0])
const infoBoxPkmn = ref(pkmnFactory.placeholderPkmn())

const teamName = ref("")

const teamRank = ref(teamRanks.get("sky/normal"))

const teamCard = ref(null)

const backgroundImage = ref(null)

const cardDimensions = ref({'width': 0 + 'px', 'height': 0 + 'px'})

function updateCardSize() {
    const tmpImg = document.createElement("img")
    const scaleFactor = props.backgroundScale
    tmpImg.src = props.background
    tmpImg.decode().then(()=> {
        cardDimensions.value = {'width': scaleFactor*tmpImg.naturalWidth + 'px', 'height': scaleFactor*tmpImg.naturalHeight + 'px'}
    })
}

watch(()=> props.background,(newBackground) => {
    updateCardSize()
})
watch(()=> props.backgroundScale,(newScale) => {
    updateCardSize()
})

function dragoverHandler(event){
	event.preventDefault();
	event.dataTransfer.dropEffect = 'copy'
}

function dragLeaveHandler(event){
    event.preventDefault();
	event.dataTransfer.dropEffect = 'none'
}

function dropHandler(event){
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
    event.dataTransfer.setData('rect', JSON.stringify(event.currentTarget.getBoundingClientRect()))
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
function openSpritePicker(event, pkmnUid){
    pickerType.value ='animation'
    pickerPkmnUid.value = pkmnUid
    //const rect = event.target.getBoundingClientRect();
    pickerPosition.value = [event.pageX+30, event.pageY]
}

function openPkmnSpecificPicker(event, pkmnUid, ptype){
    pickerType.value = ptype
    pickerPkmnUid.value = pkmnUid
    const rect = event.target.getBoundingClientRect();
    pickerPosition.value = [rect.left, rect.top]
}

function openRankPicker(event) {
    pickerType.value = 'rank'
    pickerPkmnUid.value = null
    const rect = event.target.getBoundingClientRect();
    pickerPosition.value = [rect.left, rect.top]
}

function onPickRank(pickedRank) {
    teamRank.value = pickedRank
    closeActivePicker()
}

function onPickForm(pickedFormId) {
    const pkmn = placedPkmn.value.get(pickerPkmnUid.value)
    if (pkmn){
        pkmn.formId = pickedFormId
    }
    closeActivePicker()
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

function toggleTeamMemberSpriteVisibility(event, uid) {
    placedPkmn.value.get(uid).visible ^= true
    event.currentTarget.classList.toggle("slash")
}

function onSpriteMouseOver(event, pkmnUid){
    const rect = event.currentTarget.getBoundingClientRect();
    infoBoxPosition.value = [rect.right + window.scrollX , rect.top + scrollY ]
    pointerIsOverSprite.value = true
    infoBoxPkmn.value = placedPkmn.value.get(pkmnUid)
}

function onSpriteMouseLeave(){
    pointerIsOverSprite.value = false
}

</script>

<template>
    <div id="teamCard" ref="teamCard" @dragover="dragoverHandler" @drop="dropHandler" @dragleave="dragLeaveHandler" class="team-card" :style="cardDimensions">
        <img ref="backgroundImage" :src="background" class="team-card__background" @load="updateCardSize">
        <div class="team-card__sprite-area">
            <template v-for="[uid, pkmn] in placedPkmn" :key="uid">
            <div v-show="pkmn.visible" class="pkmn" :style="{'top': pkmn.positionY+'px', 'left': pkmn.positionX+'px'}" @mouseleave="onSpriteMouseLeave" @mouseover="onSpriteMouseOver($event, pkmn.uid)">
                <!--<div class="pkmn-sprite" draggable="true" @click="openSpritePicker($event, pkmn.uid)" @dragstart="dragStart($event, pkmn.uid)">
                    <AnimatedPkmnSprite :pkmnId="pkmn.pkmnId" :formId="pkmn.formId" :animation="pkmn.animation" :start="pkmn.animationTileX" :direction="pkmn.animationTileY" :shiny="pkmn.shiny" :pixel-size="2"/>
                </div>-->
                <AnimatedPkmnSprite class="pkmn-sprite" draggable="true" @click="openSpritePicker($event, pkmn.uid)" @dragstart="dragStart($event, pkmn.uid)" :pkmnId="pkmn.pkmnId" :formId="pkmn.formId" :animation="pkmn.animation" :start="pkmn.animationTileX" :direction="pkmn.animationTileY" :shiny="pkmn.shiny" :pixel-size="2"/>
                <SpriteInfoBox class="pkmn-info-box" :pkmn="pkmn"></SpriteInfoBox>
            </div>
            </template>
        </div>
        <div class="team-card__team-member-list">
                <div v-for="[uid, pkmn] in placedPkmn" :key="uid" class="team-member">
                    <button @click="openPkmnSpecificPicker($event, pkmn.uid, 'emotion')" class="clickable_portrait">
                        <PkmnPortrait :pkmnId="pkmn.pkmnId" :formId="pkmn.formId" :emotion="pkmn.emotion" :shiny="pkmn.shiny"></PkmnPortrait>
                    </button>
                    <input v-model="pkmn.name">
                    <i class="icon-shiny team-member__toggle_shiny control-icon" @click="openPkmnSpecificPicker($event, uid, 'form')"></i>
                    <i class="icon-xcross team-member__remove control-icon" @click="removeTeamMember(uid)"></i>
                    <i class="icon-eye team-member__toggle_visibility control-icon" @click="toggleTeamMemberSpriteVisibility($event,uid)"></i>
                </div>
            </div>
        <div class="team-card__info">
            <label for="team-name" class="text-right pmd-font">
                <div class="text-right">
                    Team Name
                </div>
            </label>
            <input id="team-name" v-model="teamName" class="pmd-font text-right">
        </div>
        <div class="team-card__rank">
            <TeamRank :name="teamRank.name" :image="teamRank.image" @click="openRankPicker($event)"></TeamRank>
        </div>
    </div>
    <div v-show="pickerType != ''" @click="closeActivePicker()" class="background-overlay"></div>
    <EmotionPicker v-if="pickerType=='emotion'" @pick-emotion="onPickEmotion" :positionX="pickerPosition[0]" :positionY="pickerPosition[1]" :pkmn="placedPkmn.get(pickerPkmnUid)"></EmotionPicker>
    <AnimationPicker v-if="pickerType=='animation'" @pick-animation="setAnimation" @pick-animation-frame="setAnimationFrame" @pick-direction="setDirection" :positionX="pickerPosition[0]" :positionY="pickerPosition[1]" :pkmn="placedPkmn.get(pickerPkmnUid)"></AnimationPicker>
    <RankPicker v-if="pickerType=='rank'" :positionX="pickerPosition[0]" :positionY="pickerPosition[1]" @pick-rank="onPickRank"></RankPicker>
    <FormPicker v-if="pickerType=='form'" :pkmn-id="placedPkmn.get(pickerPkmnUid).pkmnId" :positionX="pickerPosition[0]" :positionY="pickerPosition[1]" @pick-form="onPickForm"></FormPicker>
</template>

<style>

.icon-eye {
    mask-image: url('../assets/icon/eye-solid.svg');
    background-color: var(--color-text);
    mask-repeat: no-repeat;
    mask-size: 100% auto;
    display: block;
    height: 1rem;
    width: 1rem;
}

.icon-eye.slash {
    mask-image: url('../assets/icon/eye-slash-solid.svg');
    background-color: var(--color-text);
    mask-repeat: no-repeat;
    mask-size: 100% auto;
    display: block;
    height: 1rem;
    width: 1rem;
}

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

#teamCard {
    position: relative;
    padding: 0;
    flex-grow: 0;
    flex-shrink: 0;
}

.team-card__background {
    image-rendering: pixelated;
    object-fit: contain;
    width: 100%;
    top: 0;
    left: 0;
}

.team-card__sprite-area {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.team-card__info {
    position: absolute;
    right: 2%;
    top: 2%;
}


.team-card__rank {
    position: absolute;
    right: 2%;
    bottom: 2%;
}

.team-card__info input {
    font-size: 1.5rem;
    background: rgb(0,0,0,25%);
    border: none;
    width: 8em;
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

.team-card__team-member-list {
    position: absolute;
    top: 0%;
    left: 0%;
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
    font-family: wondermail;
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

.team-member__toggle_visibility {
    position: absolute;
    right: 2rem;
    top: 0; 
}

.control-icon:hover {
    background-color: red;
}

.active-export .control-icon{
    visibility: hidden;
}


.pkmn {
    position: absolute;
    display: inline-block;

    z-index: 1;
}

.pkmn-info-box {
    display: none;
}

.pkmn:hover .pkmn-info-box {
    display: block;
}

.pkmn-sprite {
    image-rendering: pixelated;
    overflow: hidden;
}

</style>