<script setup>

import {ref} from 'vue'

const directionIndex = ref([0,1,2,3,4,5,6,7])

const emit = defineEmits(["pickDirection"])

const dir2row = [3,3,2,1,1,1,2,3]
const dir2col = [2,3,3,3,2,1,1,1]

function onClick(event, dir) {
    emit("pickDirection", dir)
    console.log(dir)
}

</script>


<template>
    <div class="direction-picker">
        <button v-for="dir in directionIndex" :key="dir" class="direction-picker__button"  @click="onClick($event, dir)" :style="{
            'grid-row': dir2row[dir],
            'grid-column': dir2col[dir]
        }">
            <i class="icon-direction-arrow" :style="{
                'transform': 'rotate('+ -45*dir +'deg)'
            }">
            </i>
        </button>
    </div>
</template>

<style>
    .direction-picker {
        display: grid;
    }

    .direction-picker__button {
        border: none;
        background: rgba(0,0,0,12%);
        justify-self: center;
    }

    .direction-picker__button:hover {
        background: rgba(0,0,0,25%);
    }

    .icon-direction-arrow {
        mask-image: url('../assets/icon/arrow-down-solid.svg');
        background-color: var(--color-text);
        mask-repeat: no-repeat;
        display: block;
        height: 0.5rem;
        width: 0.5rem;
    }

</style>