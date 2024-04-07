
const spritesCollabUri = "./SpriteCollab/" 
export const spritesLocation = spritesCollabUri + 'sprite'
export const portraitsLocation = spritesCollabUri + 'portrait'
export const spriteConfigLocation = spritesCollabUri + 'sprite_config.json'

import pkmnDataImport from './pkmn-data.json'

const spriteUrl = '/SpriteCollab/sprite/'
const portraitUrl = '/SpriteCollab/portrait/'

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
        this.animationTileX = 0
        this.animationTileY = 0
    }

    setDirection(dir){
        this.animationTileY = dir
    }
}

class PkmnDataRepository {
    constructor(){
        this.pkmnData = pkmnDataImport;
        this.animations = new Map();
    }

    pkmnIds() {
        return this.pkmnData.spriteData.map( rec => parseInt(rec.id))
    }

    getPreloadedAnimData(pkmnId){
        return this.animations.get(pkmnId)
    }

    getPortraitEmotions() {
        return this.pkmnData.spriteConfig.emotions
    }

    getPortraitSize() {
        return this.pkmnData.spriteConfig.portrait_size
    }

    getPortraitPath(pkmnId, emotion) {
        return portraitUrl + zeroPad(pkmnId) + "/" + emotion + ".png"
    }

    hasAnimData(pkmnId){
        return this.animations.has(pkmnId)
    }

    getAnimData(pkmnId){
        return this.animations.get(pkmnId)
    }

    async fetchAnimData(pkmnId){
        if (!this.animations.has(pkmnId)){
            const animRoot = spriteUrl + zeroPad(pkmnId)
            const response = await fetch(animRoot + "/AnimData.xml")
            const xmlText = await response.text()
            const parser = new DOMParser()
            const animData = parser.parseFromString(xmlText, "text/xml")
        
            const errorNode = animData.querySelector("parsererror");
            if (errorNode) {
                console.log(errorNode);
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
                            copyOf : copyOfTag[0].textContent
                        }
                    )
                } else {
                    const frameWidth = parseInt(anim.getElementsByTagName("FrameWidth")[0].textContent)
                    const frameHeight = parseInt(anim.getElementsByTagName("FrameHeight")[0].textContent)
                    const file = animRoot + "/" + name + "-Anim.png"
                    newAnimationSet.set(name,
                        {
                            file: file,
                            frameHeight: frameHeight,
                            frameWidth: frameWidth,
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
                    anim[1].file = copyRef.file
                }
            }
            this.animations.set(pkmnId, newAnimationSet)
        }
        return this.getAnimData(pkmnId) //this returns a map
    }
}

export let pkmnDataRepository = new PkmnDataRepository();