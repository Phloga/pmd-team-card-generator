#!/usr/bin/env node
import fs from 'fs';

const spritesLocation = './public/SpriteCollab/sprite'

const testMode = false


const spriteConfigImport = await import('./public/SpriteCollab/sprite_config.json' , {
    assert: { type: "json" },
  });

//import spriteConfigImport from './public/SpriteCollab/sprite_config.json' with {type: 'json'}

let spritesDir = await fs.promises.readdir(spritesLocation)

if (testMode) {
  spritesDir = spritesDir.slice(0,50);
}

const spriteData = spritesDir.map( value => {return {id : value}})


const languagesDir = await fs.promises.readdir("./src/assets/names")



const config = {
    spriteConfig: spriteConfigImport.default,
    spriteData: Array.from(spriteData),
    languages: languagesDir.map(lang => lang.slice(0,lang.length-5))
}

await fs.promises.writeFile("./src/pkmn-data.json", JSON.stringify(config))
console.log(config)
