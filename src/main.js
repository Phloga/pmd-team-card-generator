import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import CardEditor from './components/CardEditor.vue'


function reducePkmnNameArray(nameArray){
    return nameArray.reduce((obj, item, index) => {
        return {...obj, ['names.pkmn'+(index+1)]: item}
    }, {})
}

const pkmnNameArraysImport = import.meta.glob('./assets/pkmn-names/*.json', { eager: true })

const pkmnNameArrays = new Map();

for (const path in pkmnNameArraysImport) {
    const index = path.lastIndexOf("/")
    pkmnNameArrays.set(path.substring(index+1, path.length-5), reducePkmnNameArray(pkmnNameArraysImport[path].default))
}


const messages = Object.fromEntries(pkmnNameArrays.entries())

const i18n = createI18n({
    legacy: false, // you must set `false`, to use Composition API
    locale: navigator.language, // set locale
    fallbackLocale: 'en', // set fallback locale
    messages: messages
})




const app = createApp(CardEditor)
app.use(i18n)
app.mount('#app')
const accordeonNodes = document.querySelectorAll(".accordeon__header")
accordeonNodes.forEach((v) => {
    v.addEventListener("click", function() {
        this.parentNode.classList.toggle("accordeon--open")});
})