<script setup>
import { ref, computed } from 'vue';

const props = defineProps({'name': String, 'image': String})

const rankImage = ref(null)

const imageDimensions = computed(() => {
    if (rankImage.value){
        const scaleFactor = 2
        return {'width': scaleFactor*rankImage.value.naturalWidth + 'px', 'height': scaleFactor*rankImage.value.naturalHeight + 'px'}
    } else {
        return {}
    }
    //return {'width': pixelScaleFactor*props.width + 'px', 'height': pixelScaleFactor*props.height + 'px'}
})

</script>

<template>
<div class="team-rank-box">
    <img ref="rankImage" :src="image" :style="imageDimensions">
    <!--<div class="pmd-font text-centered"> {{ name }}</div>-->
</div>
</template>

<style>
.team-rank-box {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
}

.team-rank-box img {
    image-rendering: pixelated;
}

</style>