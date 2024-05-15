

const skyTeamRankImports = import.meta.glob('./assets/team-ranks/sky/*.png', { eager: true })

const teamRanksMap = new Map();


function asRankSprite(rankName, rankGroup, data){
    return {
        name: rankName,
        group: rankGroup,
        image: data
    }
}

for (const path in skyTeamRankImports) {
    const index = path.lastIndexOf("/")
    const name = path.substring(index+1, path.length-4);
    const group = 'sky'
    const image = skyTeamRankImports[path].default
    teamRanksMap.set(group + '/' + name, asRankSprite(name, group, image))
}
teamRanksMap.set('none', asRankSprite('', '', ''))


export let teamRanks = teamRanksMap