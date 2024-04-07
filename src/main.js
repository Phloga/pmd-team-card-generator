import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import CardEditor from './components/CardEditor.vue'


import pkmnNamesDeArray from './assets/names/de.json'
import pkmnNamesEnArray from './assets/names/en.json'


pkmnNamesDeArray.splice(0, 0, "Undefined")
pkmnNamesEnArray.splice(0, 0, "Undefiniert")

function reducePkmnNameArray(nameArray){
    return nameArray.reduce((obj, item, index) => {
        return {...obj, ['names.pkmn'+(index)]: item}
    }, {})
}

const pkmnNamesDe = reducePkmnNameArray(pkmnNamesDeArray)
const pkmnNamesEn = reducePkmnNameArray(pkmnNamesEnArray)

// TODO add other messages here
const messagesDe = {...pkmnNamesDe};
const messagesEn = {...pkmnNamesEn};

const messages = {
    de : messagesDe,
    en : messagesEn
}

const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: 'de', // set locale
    fallbackLocale: 'en', // set fallback locale
    messages
  })

console.log(messages)

const app = createApp(CardEditor)
app.use(i18n)
app.mount('#app')
const accordeonNodes = document.querySelectorAll(".accordeon__header")
accordeonNodes.forEach((v) => {
    v.addEventListener("click", function() {
        this.parentNode.classList.toggle("accordeon--open")});
})