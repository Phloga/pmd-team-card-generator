#!/usr/bin/env node
import fs from 'fs';

const spritesLocation = './SpriteCollab/sprite'

const pkmnNameTranslationSource = "./pokemon-names/data"
const pkmnJsonUrl = "https://raw.githubusercontent.com/PMDCollab/SpriteViewer/main/resources/pokemons.json"


const spriteConfigImport = await import('./SpriteCollab/sprite_config.json' , {
    assert: { type: "json" },
});

//import spriteConfigImport from './public/SpriteCollab/sprite_config.json' with {type: 'json'}

let spritesDir = await fs.promises.readdir(spritesLocation)


const spriteData = spritesDir.map( value => {return {
  id : value
}})



const languagesDir = await fs.promises.readdir(pkmnNameTranslationSource)



const config = {
    spriteConfig: spriteConfigImport.default,
    spriteData: Array.from(spriteData),
    languages: languagesDir.map(lang => lang.slice(0,lang.length-5))
}

await fs.promises.writeFile("./src/pkmn-data.json", JSON.stringify(config))

const promises = languagesDir.map((file) => fs.promises.copyFile(pkmnNameTranslationSource + '/' + file, "./src/assets/pkmn-names/" + file))

fetch(pkmnJsonUrl).then((response) => {
  return fs.promises.writeFile('public/pokemons.json',response.body)
})
