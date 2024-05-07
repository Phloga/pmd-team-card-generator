<script setup>
import { ref } from 'vue';
import {teamRanks} from '../team.ts'

const props = defineProps(["positionY", "positionX"])
const emit = defineEmits(["pickRank"])

function pickRank(event, rank){
    emit("pickRank", rank)
}

const teamRanksRef = ref(teamRanks)
console.log(teamRanksRef)
</script>


<template>
    <div class="rank-dropdown" :style="{'top': positionY+'px', 'left': positionX+'px'}">
        <div v-for="[k,rank] in teamRanksRef" class="rank-dropdown__entry" :key="k" @click="pickRank($event, rank)">
            <img :src="rank.image">
            <div class="pmd-font"> {{ rank.name }}</div>
        </div>
    </div>
</template>

<style>
.rank-dropdown{
    display: block;
    position: absolute;
    overflow-y: scroll;
    max-height: 100vh;
    height: 16rem;
    background: rgb(112, 204, 227);
    z-index: 11;
}

.rank-dropdown__entry {
    display: flex;
    flex-flow: row nowrap;
}

</style>