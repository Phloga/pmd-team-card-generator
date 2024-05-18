
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

function asFormId(path:string){
    if (path.length == 0)
        return ""
    const numbers = path.split('/').map((val)=>parseInt(val))
    return numbers.join('-')
}

function zeroPad(num:number){
    return String(num).padStart(4, '0')
}

function fallbackAnimation(pkmnId: number, formId:string){
    return {pkmnId: 0 , formId: ""}
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
        this.formId = ''
    }

    setDirection(dir : number){
        this.animationTileY = dir
    }
}

interface CreditsRecord {timestamp: string, name: string, contact: string, resources: string[]}

class PkmnDataRepository {
    pkmnData : any
    pkmnForms: Map<number, any>
    animations: Map<string,any>
    spriteCredits: Map<string, Array<CreditsRecord>>
    portraitCredits: Map<string, Array<CreditsRecord>>
    creditsNames: Map<string, {name: string, contact:string}>

    constructor(){
        this.pkmnData = pkmnDataImport
        this.animations = new Map()
        this.spriteCredits = new Map()
        this.portraitCredits = new Map()
        this.creditsNames = new Map()
        this.pkmnForms = new Map()
    }

    async fetchPkmnIds() {
        const pkmns = await this.fetchPokemonForms()
        return Array.from(pkmns.keys()).map((pkmnId: any) => parseInt(pkmnId))
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
        return this.pkmnForms.get(pkmnId)[formId] != null
    }

    getFormsList(pkmnId:number){
        if (!this.pkmnForms.has(pkmnId)) {
            return []
        }

        const forms : Array<[string, {fullName: string, path: string}]> = Object.entries(this.pkmnForms.get(pkmnId))
        console.log(forms)
        return forms.map(([key,value]) => {
                return {
                    formId: key,
                    name: key != "" ? value.fullName : "Normal",
                    path: value.path
                }
            }
        )
    }


    formPath(pkmnId:number , formId:string, portrait:boolean){
        const path = zeroPad(pkmnId) + '/' + this.pkmnForms.get(pkmnId)[formId].path + '/'
        //TODO handle missing sprites portraits

        if (portrait)
            return portraitUrl + path
        else
            return spriteUrl + path
    }

    getPortraitPath(pkmnId:number, formId:string, emotion:string) {
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

    async fetchPokemonForms() {
        if (this.pkmnForms.size != 0) {
            return this.pkmnForms
        }
        const pokemons = await fetch(spriteCollabPokemonsUrl).then((response)=> response.json());

        this.pkmnForms = new Map(
            pokemons.map((obj: { id: number; forms: any }) => 
                [
                    obj.id, 
                    Object.fromEntries(obj.forms.map((v: { path: string, fullName: string })=> [asFormId(v.path), v]))
                ])
        );
        console.log(this.pkmnForms)
        /*
        for (const pix in pokemons){
            this.pkmnMap.set(pix, {
                name : pokemons[pix],
                forms : pokemons[pix].forms
            })
        }*/
        return this.pkmnForms
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
        const credits = new Array<{timestamp: string, name: string, contact: string, resources: string[]}>()
        let i = 0
        let j = 0
        while ((j = txt.indexOf('\n', i)) !== -1) {
            const line = txt.substring(i, j).split(/[\s\t]+/);
            const resources = line[5].split(',')
            i = j + 1;
            const creatorInfo = this.creditsNames.get(line[2])
            const creator = creatorInfo != null ? creatorInfo : {name:line[2], contact:""}
            credits.push({timestamp: line[0] + line[1], name: creator.name, contact:creator.contact, resources: resources})
        }
        return credits
    }

    async fetchCredits(pkmnId:number, formId:string, portrait:boolean) {
        if (this.creditsNames.size == 0){
            const names = await fetch(pmdSpriteCollabBaseUrl + 'credit_names.txt')
            this.creditsNames = this.parseCreditNames(await names.text())
        }

        const pkmnKey = this.compositeKey(pkmnId, formId)
        const credits = portrait ? this.portraitCredits : this.spriteCredits 

        if (!credits.has(pkmnKey)){
            const rootPath =  this.formPath(pkmnId,formId,portrait)
            const response = await fetch(rootPath + "/credits.txt")
            const text = await response.text()
            credits.set(pkmnKey, this.parseCredits(text))
        }
        return credits.get(pkmnKey)
    }
}

export let pkmnFactory = new PkmnFactory()

export {PkmnSpritePlacement}
export let pkmnDataRepository = new PkmnDataRepository();