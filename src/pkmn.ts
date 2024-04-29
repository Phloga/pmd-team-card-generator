
const spritesCollabUri = "./SpriteCollab/" 
export const spritesLocation = spritesCollabUri + 'sprite'
export const portraitsLocation = spritesCollabUri + 'portrait'
export const spriteConfigLocation = spritesCollabUri + 'sprite_config.json'

import pkmnDataImport from './pkmn-data.json'

const pmdSpriteCollabBaseUrl = "https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/"
//const pmdSpriteCollabBaseUrl = "/SpriteCollab/"

const spriteUrl = pmdSpriteCollabBaseUrl + 'sprite/'
const portraitUrl = pmdSpriteCollabBaseUrl + 'portrait/'

//const creditsPath = pmdSpriteCollabBaseUrl + "credit_names.txt"

function zeroPad(num:number){
    return String(num).padStart(4, '0')
}

class PkmnFactory {
    counter: number

    constructor() {
        this.counter = 0
    }

    makePkmn(pkmnId : number, animation : string, positionX : number, positionY : number){
        const newPkmn = new PkmnSpritePlacement(this.counter, pkmnId, "", animation, "Normal", positionX, positionY)
        ++this.counter 
        return newPkmn
    }

    clonePkmn(pkmn : PkmnSpritePlacement){
        const newPkmn = new PkmnSpritePlacement(this.counter, pkmn.pkmnId, pkmn.name, pkmn.animation, pkmn.emotion, pkmn.positionX, pkmn.positionY)
        ++this.counter 
        return newPkmn
    }
}

export let pkmnFactory = new PkmnFactory()

class PkmnSpritePlacement {
    uid: number
    pkmnId: number
    animation: string
    positionX: number
    positionY: number
    name: string
    emotion: string
    shiny: boolean
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
        this.shiny = false
        this.animationTileX = 0
        this.animationTileY = 0
        this.maxAnimationTileX = 0
    }

    setDirection(dir : number){
        this.animationTileY = dir
    }
    
    toggleShiny(){
        this.shiny = !this.shiny
    }
}

class PkmnDataRepository {
    pkmnData : any
    animations: Map<string,any>

    constructor(){
        this.pkmnData = pkmnDataImport;
        this.animations = new Map();
    }

    pkmnIds() {
        return this.pkmnData.spriteData.map( (rec: any) => parseInt(rec.id)).filter((v: any) => v != 0)
    }

    getLanguages() {
        return this.pkmnData.languages
    }

    compositeKey(pkmnId : number, shiny:boolean){
        let key = pkmnId.toString()
        if (shiny){
            key = key + "s"
        }
        return key
    }

    getPreloadedAnimData(pkmnId:number, shiny=false){
        return this.animations.get(this.compositeKey(pkmnId, shiny))
    }

    getPortraitEmotions() {
        return this.pkmnData.spriteConfig.emotions
    }

    getPortraitSize() {
        return this.pkmnData.spriteConfig.portrait_size
    }

    variantPath(basePath:string, shiny:boolean, form:number = 0) {
        let path = basePath
        
        if (shiny) {
            if (form == 0){
                path = path + "/0000/0001"
            } else {
                path = path + "/0001"
            }
        }
        return path
    }

    getPortraitPath(pkmnId:number, emotion:string, shiny:boolean) {
        let base = portraitUrl + zeroPad(pkmnId)
        return this.variantPath(base, shiny) + "/" + emotion + ".png"
    }

    hasAnimData(pkmnId:number, shiny=false){
        return this.animations.has(this.compositeKey(pkmnId, shiny))
    }

    getAnimData(pkmnId:number, shiny=false){
        return this.animations.get(this.compositeKey(pkmnId, shiny))
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

    async fetchAnimData(pkmnId:number, shiny=false){
        const pkmnKey = this.compositeKey(pkmnId, shiny)
        if (!this.animations.has(pkmnKey)){
            const animRoot = this.variantPath(spriteUrl + zeroPad(pkmnId), shiny)
            const response = await fetch(animRoot + "/AnimData.xml")
            const xmlText = await response.text()
            const parser = new DOMParser()
            const animData = parser.parseFromString(xmlText, "text/xml")
        
            const errorNode = animData.querySelector("parsererror")!;
            if (errorNode) {
                throw new Error("Failed to Parse " + animRoot + "/AnimData.xml\nerrorNode:\n" + errorNode)
            }
            this.animations.set(pkmnKey, this.parseAnimData(animData, animRoot))
        }
        return this.getAnimData(pkmnId, shiny) //this returns a map
    }
}

export let pkmnDataRepository = new PkmnDataRepository();