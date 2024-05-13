<script setup>

const props = defineProps({
    items: {type: Array, required: true},
    positionX: {type: Number, required: true},
    positionY: {type: Number, required: true}
})

const emit = defineEmits(["selected"])

</script>

<template>
    <div class="dropdown-container" :style="{'top': positionY+'px', 'left': positionX+'px'}">
        <template v-for="item,i in items" :key="i">
            <div class="dropdown-container__item" @click="emit('selected', item.id)"> {{ item.text }}</div>
        </template>
    </div>
</template>

<style>
.dropdown-container{
    display: block;
    position: absolute;
    overflow-y: scroll;
    max-height: 100vh;
    height: 16rem;
    background: var(--color-md-textbox-bg);
    z-index: 11;
    box-shadow: 1px;
}

.dropdown-container__item:hover {
    background-color: rgba(255,255,255,50%);
}

</style>