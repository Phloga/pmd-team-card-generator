
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

function zeroPad(num){
    return String(num).padStart(4, '0')
}

class PkmnFactory {
    constructor() {
        this.counter = 0
    }

    makePkmn(pkmnId, animation, positionX, positionY){
        const newPkmn = new PkmnSpritePlacement(this.counter, pkmnId, "", animation, "Normal", positionX, positionY)
        ++this.counter 
        return newPkmn
    }

    clonePkmn(pkmn){
        const newPkmn = new PkmnSpritePlacement(this.counter, pkmn.pkmnId, pkmn.name, pkmn.animation, pkmn.emotion, pkmn.positionX, pkmn.positionY)
        ++this.counter 
        return newPkmn
    }
}

export let pkmnFactory = new PkmnFactory()

class PkmnSpritePlacement {
    constructor(uid ,pkmnId, name, animation, emotion, positionX, positionY){
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

    setDirection(dir){
        this.animationTileY = dir
    }
    
    toggleShiny(){
        this.shiny = !this.shiny
    }
}

class PkmnDataRepository {
    constructor(){
        this.pkmnData = pkmnDataImport;
        this.animations = new Map();
    }

    pkmnIds() {
        return this.pkmnData.spriteData.map( rec => parseInt(rec.id)).filter((v) => v != 0)
    }

    getLanguages() {
        return this.pkmnData.languages
    }

    compositeKey(pkmnId, shiny){
        let key = pkmnId.toString()
        if (shiny){
            key = key + "s"
        }
        return key
    }

    getPreloadedAnimData(pkmnId, shiny=false){
        return this.animations.get(this.compositeKey(pkmnId, shiny))
    }

    getPortraitEmotions() {
        return this.pkmnData.spriteConfig.emotions
    }

    getPortraitSize() {
        return this.pkmnData.spriteConfig.portrait_size
    }

    variantPath(basePath, shiny) {
        let path = basePath
        if (shiny) {
            path = path + "/0000/0001"
        }
        return path
    }

    getPortraitPath(pkmnId, emotion, shiny) {
        let base = portraitUrl + zeroPad(pkmnId)
        return this.variantPath(base, shiny) + "/" + emotion + ".png"
    }

    hasAnimData(pkmnId, shiny=false){
        return this.animations.has(this.compositeKey(pkmnId, shiny))
    }

    getAnimData(pkmnId, shiny=false){
        return this.animations.get(this.compositeKey(pkmnId, shiny))
    }

    async fetchAnimData(pkmnId, shiny=false){
        const pkmnKey = this.compositeKey(pkmnId, shiny)
        if (!this.animations.has(pkmnKey)){
            const animRoot = this.variantPath(spriteUrl + zeroPad(pkmnId), shiny)
            const response = await fetch(animRoot + "/AnimData.xml")
            const xmlText = await response.text()
            const parser = new DOMParser()
            const animData = parser.parseFromString(xmlText, "text/xml")
        
            const errorNode = animData.querySelector("parsererror");
            if (errorNode) {
                //console.log(errorNode);
                throw new Error("Failed to Parse " + animRoot + "/AnimData.xml\nerrorNode:\n" + toString(errorNode))
            }
    
            const anims = animData.getElementsByTagName("Anims")[0].getElementsByTagName("Anim")
        
            const newAnimationSet = new Map();

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
                    const frameWidth = parseInt(anim.getElementsByTagName("FrameWidth")[0].textContent)
                    const frameHeight = parseInt(anim.getElementsByTagName("FrameHeight")[0].textContent)
                    const durationsNode = anim.getElementsByTagName("Durations")[0]
                    const durations = Array.from(durationsNode.getElementsByTagName("Duration")).map((element) => {
                        return parseInt(element.textContent)
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
            this.animations.set(pkmnKey, newAnimationSet)
        }
        return this.getAnimData(pkmnId, shiny) //this returns a map
    }
}

export let pkmnDataRepository = new PkmnDataRepository();