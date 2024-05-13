<script setup>
import { computed } from 'vue';
import DropDown from './DropDown.vue';
import { pkmnDataRepository } from '@/pkmn';

const props = defineProps({
    pkmnId : {type: Number, required: true},
    positionX: {type: Number, required: true},
    positionY: {type: Number, required: true}
})
const emit = defineEmits(["pickForm"])

const forms = computed(
    () => {
        return pkmnDataRepository.getFormsList(props.pkmnId).map((form) => {
            return {id: form.formId, text: form.name}}
        )
    }
)

</script>

<template>
    <DropDown :items="forms" @selected="emit('pickForm', $event)" :positionX="positionX" :positionY="positionY"></DropDown>
</template>