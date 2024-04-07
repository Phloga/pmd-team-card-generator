<script setup>

import { computed, onMounted, ref } from 'vue';

import {pkmnDataRepository} from '../pkmn.js'

const props = defineProps(["pkmnId", "emotion"])

const portraitPath = computed(() => {
    return pkmnDataRepository.getPortraitPath(props.pkmnId, props.emotion)
})

const portraitSize = ref(pkmnDataRepository.getPortraitSize())

</script>

<template>
    <div ref="spriteContainer" class="sprite-container" :style="
        {width: portraitSize+'px', height: portraitSize+'px'}">
        <img :src="portraitPath" draggable="false"/>
    </div>
</template>

<style>
</style>