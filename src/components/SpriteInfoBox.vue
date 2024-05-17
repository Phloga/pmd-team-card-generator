<script setup>
import { PkmnSpritePlacement, pkmnDataRepository } from '@/pkmn';
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
    "pkmn" : {type:PkmnSpritePlacement, required:true}
})

const spriteCreator = ref("error")

async function updateCredits(){
    const creditsList = await pkmnDataRepository.fetchCredits(props.pkmn.pkmnId, props.pkmn.formId, false)
    if (creditsList == null){
        spriteCreator.value = "error: failed to fetch credits"
        return 
    }
    
    for (const credits of creditsList){
        if (credits.resources.find((v,i,o)=> v == props.pkmn.animation) != -1) {
            spriteCreator.value = credits.name
            return
        }
    }
    spriteCreator.value = "error: credits not found"
}

watch(() => props.pkmn.formId, (newForm, oldForm) => {
    updateCredits()
})

watch(() => props.pkmn.animation, (newForm, oldForm) => {
    updateCredits()
})

onMounted( async () => {
    updateCredits()
})


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