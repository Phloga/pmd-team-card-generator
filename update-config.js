#!/usr/bin/env node
import fs from 'fs';

const spritesLocation = './SpriteCollab/sprite'
const pkmnNameTranslationSource = "./pokemon-names/data"
const pkmnJsonUrl = "https://raw.githubusercontent.com/PMDCollab/SpriteViewer/main/resources/pokemons.json"


const spriteServerEndpoint = "https://spriteserver.pmdcollab.org/graphql"

const spriteConfigImport = await import('./SpriteCollab/sprite_config.json' , {
    assert: { type: "json" },
});

async function querySpecific(pkmnId){
  const qlQuery = {
    "operationName":"Pokemon",
    "variables":{"id":pkmnId},
    "query":`query Pokemon($id: Int!) {
      monster(filter: [$id]) {
          id
          name
          forms {
            path
            name
            fullName
          }
        }
      }`
    }
}

async function queryAll(){
  const qlQuery = {
    "operationName":"Pokemon",
    "variables" : null,
    "query":`query Pokemon {
      monster {
          id
          forms {
            path
            name
            fullName
          }
        }
      }`
    }

  const request = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    referrerPolicy: "strict-origin-when-cross-origin",
    body: JSON.stringify(qlQuery)
  }
  const response = await fetch(spriteServerEndpoint, request)
  const data = await response.json()
  return data
}

//const pokemon = new Map((await queryAll()).data.monster.map((obj) => [obj.id, obj.forms]));

fs.promises.writeFile('public/pokemons.json',JSON.stringify((await queryAll()).data.monster))

const languagesDir = await fs.promises.readdir(pkmnNameTranslationSource)

const config = {
    spriteConfig: spriteConfigImport.default,
    languages: languagesDir.map(lang => lang.slice(0,lang.length-5))
}

await fs.promises.writeFile("./src/pkmn-data.json", JSON.stringify(config))

const promises = languagesDir.map((file) => fs.promises.copyFile(pkmnNameTranslationSource + '/' + file, "./src/assets/pkmn-names/" + file))

