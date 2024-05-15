<script setup>
import { PkmnSpritePlacement, pkmnDataRepository } from '@/pkmn';
import { computed } from 'vue';

const props = defineProps({
    "pkmn" : {type:PkmnSpritePlacement, required:true}
})


const spriteCreator = computed(() => {
    //pkmnDataRepository.get
    return "TODO"
})
//
</script>


<template>
    <div class="sprite-info-box">
        <div> {{ pkmn.name }}</div>
        <div class="sprite-info-box__credits">Sprite by {{spriteCreator}}</div>
    </div>
</template>

<style>
.sprite-info-box {
    display: flex;
    font-size: small;
    text-align: center;
    background-color: var(--color-md-textbox-bg);
    border-radius: 0.33rem;
    padding: 3px;
    margin: 0.15rem;
}

.sprite-info-box__credits {
    font-size:xx-small;
    color: lightgrey;
}

</style>