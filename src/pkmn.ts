
const spritesCollabUri = "./SpriteCollab/" 
export const spritesLocation = spritesCollabUri + 'sprite'
export const portraitsLocation = spritesCollabUri + 'portrait'
export const spriteConfigLocation = spritesCollabUri + 'sprite_config.json'

import pkmnDataImport from './pkmn-data.json'

//const pmdSpriteCollabBaseUrl = "https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/"
const pmdSpriteCollabBaseUrl = "/SpriteCollab/"

const spriteUrl = pmdSpriteCollabBaseUrl + 'sprite/'
const portraitUrl = pmdSpriteCollabBaseUrl + 'portrait/'

//const spriteCollabPokemonsUrl = "https://raw.githubusercontent.com/PMDCollab/SpriteViewer/main/resources/pokemons.json"
const spriteCollabPokemonsUrl = "/pokemons.json"

//const creditsPath = pmdSpriteCollabBaseUrl + "credit_names.txt"


function zeroPad(num:number){
    return String(num).padStart(4, '0')
}

function fallbackAnimation(pkmnId: number, formId:string){
    const base = formId.substring(0,4);
    const mods = formId.substring(4);
    if (mods.length > 0) {
        return {pkmnId: pkmnId, formId: base+mods.slice(1)}
    } 
    else if (formId != "0000"){
        return {pkmnId: pkmnId, formId: "0000"}
    }
    else if (pkmnId != 0) {
        return {pkmnId: 0, formId: "0000"}
    } else {
        return {pkmnId: 0 , formId: null}
    }
}

class PkmnFactory {
    counter: number
    placeholder: PkmnSpritePlacement

    constructor() {
        this.counter = 0
        this.placeholder = new PkmnSpritePlacement(-1, 0, "", "Normal", "Normal", 0, 0)
    }

    placeholderPkmn() {
        return this.placeholder
    }

    makePkmn(name: string, pkmnId : number, animation : string, positionX : number, positionY : number){
        const newPkmn = new PkmnSpritePlacement(this.counter, pkmnId, name, animation, "Normal", positionX, positionY)
        ++this.counter 
        return newPkmn
    }

    clonePkmn(pkmn : PkmnSpritePlacement){
        const newPkmn = new PkmnSpritePlacement(this.counter, pkmn.pkmnId, pkmn.name, pkmn.animation, pkmn.emotion, pkmn.positionX, pkmn.positionY)
        ++this.counter 
        return newPkmn
    }
}

class PkmnSpritePlacement {
    uid: number
    pkmnId: number
    formId: string
    animation: string
    positionX: number
    positionY: number
    name: string
    emotion: string
    animationTileX: number
    animationTileY: number
    maxAnimationTileX: number

    constructor(uid : number,pkmnId : number, name : string, animation : string, emotion : string, positionX : number, positionY : number){
        this.uid = uid
        this.pkmnId = pkmnId
        this.animation = animation
        this.positionX = positionX
        this.positionY = positionY
        this.name = name
        this.emotion = emotion
        this.animationTileX = 0
        this.animationTileY = 0
        this.maxAnimationTileX = 0
        this.formId = '0000'
    }

    setDirection(dir : number){
        this.animationTileY = dir
    }
}

class PkmnDataRepository {
    pkmnData : any
    pkmnMap: Map<string, any>
    animations: Map<string,any>
    credits: Map<string, any>
    creditsNames: Map<string, {name: string, contact:string}>

    constructor(){
        this.pkmnData = pkmnDataImport
        this.animations = new Map()
        this.credits = new Map()
        this.creditsNames = new Map()
        this.pkmnMap = new Map()
    }

    async fetchPkmnIds() {
        const pkmns = await this.fetchPokemonMap()
        return Array.from(pkmns.keys()).map((pkmnIx: any) => parseInt(pkmnIx))
    }

    getLanguages() {
        return this.pkmnData.languages
    }

    compositeKey(pkmnId : number, formId:string){
        return pkmnId.toString() + '-' + formId
    }

    getPreloadedAnimData(pkmnId:number, formId:string){
        return this.animations.get(this.compositeKey(pkmnId, formId))
    }

    getPortraitEmotions() {
        return this.pkmnData.spriteConfig.emotions
    }

    getPortraitSize() {
        return this.pkmnData.spriteConfig.portrait_size
    }

    hasForm(pkmnId:number, formId:string){
        return this.pkmnMap.get(zeroPad(pkmnId)).forms[formId] != null
    }

    hasFemaleForm(pkmnId:number, baseFormId:string){
        return this.hasForm(pkmnId, baseFormId+'f')
    }

    hasShinyForm(pkmnId:number, baseFormId:string){
        return this.hasForm(pkmnId, baseFormId+'s')
    }

    getForm(pkmnId:number, formId:string) : {name: string, path: string}{
        const form = this.pkmnMap.get(zeroPad(pkmnId)).forms[formId];
        return {
            name: form.name,
            path: form.botPath
        }
    }

    getFormsList(pkmnId:number){
        const sPkmnId = zeroPad(pkmnId)
        if (!this.pkmnMap.has(sPkmnId)) {
            return []
        }

        const forms : Array<[string, {name: string, botPath: string}]> = Object.entries(this.pkmnMap.get(zeroPad(pkmnId)).forms)
        return forms.map(([key,value]) => {
                return {
                    formId: key,
                    name: value.name,
                    path: value.botPath
                }
            }
        )
    }


    formPath(pkmnId:number , formId:string, portrait:boolean){
        const path = this.pkmnMap.get(zeroPad(pkmnId)).forms[formId].botPath
        //TODO handle missing sprites portraits

        if (portrait)
            return portraitUrl.slice(0, -1) + path
        else
            return spriteUrl.slice(0, -1) + path
    }

    getPortraitPath(pkmnId:number, formId:string, emotion:string) {
        console.log(formId)
        return this.formPath(pkmnId, formId, true) + emotion + ".png"
    }

    hasAnimData(pkmnId:number, formId:string){
        return this.animations.has(this.compositeKey(pkmnId, formId))
    }

    getAnimData(pkmnId:number, formId:string){
        return this.animations.get(this.compositeKey(pkmnId, formId))
    }

    parseAnimData(animData: Document, animRoot: string){
        const newAnimationSet = new Map();
        const anims = animData.getElementsByTagName("Anims")[0].getElementsByTagName("Anim")

        for (const anim of anims){
            const name = anim.getElementsByTagName("Name")[0].textContent
            const copyOfTag = anim.getElementsByTagName("CopyOf")

            if (copyOfTag.length > 0) {
                newAnimationSet.set(name,
                    {
                        file: null,
                        frameHeight: null,
                        frameWidth: null,
                        durations: [],
                        copyOf : copyOfTag[0].textContent
                    }
                )
            } else {
                const frameWidth = parseInt(anim.getElementsByTagName("FrameWidth")[0].textContent!)
                const frameHeight = parseInt(anim.getElementsByTagName("FrameHeight")[0].textContent!)
                const durationsNode = anim.getElementsByTagName("Durations")[0]
                const durations = Array.from(durationsNode.getElementsByTagName("Duration")).map((element) => {
                    return parseInt(element.textContent!)
                })
                const file = animRoot + "/" + name + "-Anim.png"
                newAnimationSet.set(name,
                    {
                        file: file,
                        frameHeight: frameHeight,
                        frameWidth: frameWidth,
                        durations: durations,
                        copyOf : ""
                    }
                )
            }
        }
        //follow copyOf references
        for (const anim of newAnimationSet){
            if (anim[1].copyOf.length > 0){
                const copyRef = newAnimationSet.get(anim[1].copyOf)
                anim[1].frameHeight = copyRef.frameHeight
                anim[1].frameWidth = copyRef.frameWidth
                anim[1].durations = copyRef.durations
                anim[1].file = copyRef.file
            }
        }
        return newAnimationSet
    }

    async fetchPokemonMap() {
        if (this.pkmnMap.size != 0) {
            return this.pkmnMap
        }

        const pokemons = await fetch(spriteCollabPokemonsUrl).then((response)=> response.json());

        for (const pix in pokemons){
            this.pkmnMap.set(pix, {
                name : pokemons[pix],
                forms : pokemons[pix].forms
            })
        }
        return this.pkmnMap
    }

    async fetchAnimData(prefPkmnId:number, prefFormId:string){
        let pkmnId = prefPkmnId
        let formId : string | null = prefFormId
        const pkmnKey = this.compositeKey(prefPkmnId, prefFormId)
        while (formId != null && !this.animations.has(pkmnKey)){
            //const animRoot = this.variantPath(spriteUrl + zeroPad(pkmnId), shiny)
            if (!this.hasForm(pkmnId, formId)) {
                ({pkmnId, formId} = fallbackAnimation(pkmnId, formId))
                continue
            }
            
            const animRoot = this.formPath(pkmnId, formId, false)
            const response = await fetch(animRoot + "AnimData.xml")
            
            if (!response.ok){
                //console.log("status " + response.status + " for " + animRoot + "AnimData.xml" )
                ({pkmnId, formId} = fallbackAnimation(pkmnId, formId))
                continue
            }
            const xmlText = await response.text()
            const parser = new DOMParser()

            const animData = parser.parseFromString(xmlText, "text/xml")
    
            const errorNode = animData.querySelector("parsererror");
            if (errorNode != null) {
                ({pkmnId, formId} = fallbackAnimation(pkmnId, formId))
                continue
            }
            this.animations.set(pkmnKey, this.parseAnimData(animData, animRoot))
        }
        if (formId == null){
            throw new Error("Failed to retrieve any fallback sprites")
        }
        return this.getAnimData(prefPkmnId, prefFormId) //this returns a map
    }

    parseCreditNames(txt:string) {
        const credits = new Map<string, {name: string, contact:string}>()
        let i = 0
        let j = 0
        while ((j = txt.indexOf('\n', i)) !== -1) {
            const line = txt.substring(i, j).split(' ');
            i = j + 1;
            if (line.length < 3) {
                line.push('')
            }
            credits.set(line[1], {name: line[0], contact: line[2]})
        }
        return credits
    }

    parseCredits(txt:string){
        const credits = new Array<{timestamp: string, handle: string}>()
        let i = 0
        let j = 0
        while ((j = txt.indexOf('\n', i)) !== -1) {
            const line = txt.substring(i, j).split(' ');
            i = j + 1;
            credits.push({timestamp: line[0], handle: line[1]})
        }
        return credits
    }

    async fetchCreditsNames(){
        if (this.creditsNames.size == 0){
            const names = await fetch(pmdSpriteCollabBaseUrl + 'credit_names.txt')
            this.creditsNames = this.parseCreditNames(await names.text())
        }
        return this.creditsNames
    }

    async fetchCredits(pkmnId:number, formId:string) {
        const pkmnKey = this.compositeKey(pkmnId, formId)
        if (!this.credits.has(pkmnKey)){
            const animRoot = this.formPath(pkmnId,formId,false)
            const response = await fetch(animRoot + "/credits.txt")
            const text = await response.text()
            this.credits.set(pkmnKey, this.parseCredits(text))
        }
        return this.credits.get(pkmnKey)
    }
}

export let pkmnFactory = new PkmnFactory()

export {PkmnSpritePlacement}
export let pkmnDataRepository = new PkmnDataRepository();