const el = require('../el/_el.js')
const event = require('../service/event.js')
const data = require('../service/data.js')
const http = require('../service/http.js')
const battler = require('../service/diamondbattler.js')

const watch = () => {
  // const pubkey = data`pubkey`()
  // if(!pubkey) return location.hash = '#'

  let watch
  if(!data`watch`() && location.search) {
    const id = location.search.substring(4)
    if(id.substring(0,1) == '-'){
      console.log('id', id)
      http.post('hostReport', {id}).then(
        res => {
          console.log('res', res)
          watch = data`watch`(res)
          location.hash = '#'
          setTimeout(() => location.hash = '#watch',0)
        },
        er => locaiton.hash = '#battle'
      )
    }
      return ''
  } else {
    watch = data`watch`()
    if(!watch) location.hash = '#battle'
  }
  
  console.log('watch', watch)
  
  const sceneRoundStart = i => {
    return {scene: 'RoundStart', index: i}
  }

  const sceneArmorRoll = (playerIndex, rolls) => {
    const dice = watch.players[playerIndex-1].protection
    return {scene: 'ArmorRoll', rolls, value: rolls.reduce((a,b)=>a+b,0), index: playerIndex, dice}
  }

  const sceneSpeedRoll = (rolls) => {
    return {scene: 'SpeedRoll', rolls}
  }

  const sceneQueAction = (action, round) => {
    const armor = round.armor
    const hp = [0,1].map(i => watch.players[i].info.hp)
    return {scene: 'QueAction', action, armor, hp}
  }

  const sceneWinner = index => {
    return {scene: 'Winner', index}
  }

  const drawRoundStart = scene => `
    <h1>Round ${scene.index}</h1>
  `

  const drawArmorRoll = scene => {
    
    document.querySelector(`#armor${scene.index-1}`).title = `Armor: ${scene.value} / ${scene.value}`
    document.querySelector(`#armor${scene.index-1} .determinate`).style.width= `100%`
    document.querySelector(`#armor${scene.index-1} p`).innerText = `${scene.value} / ${scene.value}`
    
    return `
      ${el.card('', `
        ${el.col('s4 valign-wrapper', img(scene.index-1, 'circle'))}
        ${el.col('s8 valign-wrapper', `<b>Armor: ${scene.value}</b>`)}
      `)}
      ${scene.rolls.map((r, i) => el.card('card-thin', `
        1d${scene.dice[i]}: ${r}
      `)).join('')}
    `
  }

  const img = (i, classList) => `<img src=${watch.players[i].info.image} class="responsive-img ${classList || ''}">`
  const icon = i => `<img src=${watch.players[i].info.image} class="circle" width="64" height="64">`

  const drawSpeedRoll = scene => scene.rolls.map(obj => el.card('card-thin', ` 
      ${el.col('s3 m2 valign-wrapper', img(obj.i-1, 'circle'))}
      ${el.col('s9 m10 valign-wrapper', `<b>${obj.name}</b>`)}
    `)
  ).join('').split('row').join('row valign-wrapper')
  
  const drawWinner = scene => `
    <h1>Winner!</h1>
    ${img(scene.index -1)}
  `

  const getAbilityDice = name => {
    let res
    Object.values(battler.traits).find(cat =>
      Object.values(cat).find(o => {
        if(!o.ability) return undefined
        else if(o.ability.name === name) return res = o.ability.dice
      })
    )
    return res
  }

  const drawQueAction = (scene) => {
    console.log('action', scene)
    const a = scene.action

    for(let i = 0; i < 2; i++){
      console.log(i, a.stats[i], scene.armor[i])
      document.querySelector(`#armor${i}`).title = `Armor: ${a.stats[i].armor} / ${scene.armor[i]}`
      document.querySelector(`#armor${i} .determinate`).style.width= `${(a.stats[i].armor / scene.armor[i]) * 100}%`
      document.querySelector(`#armor${i} p`).innerText = `${a.stats[i].armor} / ${scene.armor[i]}`
      document.querySelector(`#hp${i}`).title = `Health: ${a.stats[i].hp} / ${scene.hp[i]}`
      document.querySelector(`#hp${i} .determinate`).style.width= `${(a.stats[i].hp / scene.hp[i]) * 100}%`
      document.querySelector(`#hp${i} p`).innerText = `${a.stats[i].hp} / ${scene.hp[i]}`
    }
    const attacker = a.i === 1 ? 0 : 1
    const defender = a.i === 2 ? 0 : 1
    
    return el.card('', `
      ${el.row(
        el.col('s6', img(attacker)),
        el.col('s6', img(defender))
      )}
      <span class="card-title">${a.name}</span>    
      <div>${a.damage} damage (1d${getAbilityDice(a.name)})</div>
    `)
  }

  let replay = [], sceneIndex = 0
  watch.reports.forEach((round, i) => {
    replay.push(sceneRoundStart(i+1))
    replay.push(sceneArmorRoll(1, round.d1ArmorRolls))
    replay.push(sceneArmorRoll(2, round.d2ArmorRolls))
    replay.push(sceneSpeedRoll(round.speed))
    replay.push(...round.que.map(action => sceneQueAction(action, round)))
  })
  const winner = replay[replay.length - 1].action.winner
  replay.push(sceneWinner(winner))
  console.log('replay', replay)

  const draw = () => {
    const scene = replay[sceneIndex]
    console.log('draw', sceneIndex, scene)
    switch(scene.scene){
      case 'RoundStart': return drawRoundStart(scene)
      case 'ArmorRoll': return drawArmorRoll(scene)
      case 'SpeedRoll': return drawSpeedRoll(scene)
      case 'QueAction': return drawQueAction(scene)
      case 'Winner': return drawWinner(scene)
    }
  }

  const canvas = event.guid()
  const sceneId = event.guid()
  
  const prevId = event.click(el => {
    sceneIndex--
    if(sceneIndex < 0) sceneIndex = 0
    document.querySelector(`#${canvas}`).innerHTML = draw()
    document.querySelector(`#${sceneId}`).innerText = `${sceneIndex + 1} / ${replay.length}`
  })
  
  const nextId = event.click(el => {
    sceneIndex++
    if(sceneIndex >= replay.length) sceneIndex = replay.length - 1
    document.querySelector(`#${canvas}`).innerHTML = draw()
    document.querySelector(`#${sceneId}`).innerText = `${sceneIndex + 1} / ${replay.length}`
  })

  let autoplay, autoSpeed = 900
  const autoplayId = event.click(el => {
    autoplay = !autoplay
    if(autoplay){
      // sceneIndex = 0
      document.querySelector(`#${canvas}`).innerHTML = draw()
      setTimeout(() => runAutoplay(), autoSpeed)
      el.innerText = 'Stop'
    }else {
      el.innerText = 'Auto Play'
    }
  })

  const runAutoplay = () => setTimeout(() => {
    if(autoplay){
      document.querySelector(`#${nextId}`).click()
      if(sceneIndex >= replay.length - 1) {
        autoplay = false
        document.querySelector(`#${autoplayId}`).innerText = 'Auto Play'
      }
      if(autoplay) runAutoplay()
    }
  }, autoSpeed)

  const dbCard = i => el.card('', `
    <div id="db${i}">
      <div>${el.range(0, 1, `armor${i}`, 'yellow', 'yellow lighten-4 bar-thick')}</div>
      <div>${el.range(1, 1, `hp${i}`, '', 'bar-thick')}</div>
    </div>
  `, `
    <div class="card-image">
      ${img(i)}
      <span class="card-title">${watch.players[i].speed}</span>
    </div>`
  )

  const route = el.route(
    el.row(
      `<div class="row">
        <div class="col s4">
          ${dbCard(0)}
        </div>
        <div class="col s4" id="${canvas}">
        </div>
        <div class="col s4">
          ${dbCard(1)}
        </div>
      </div>`,
      el.card('blue lighten-3',
        `<div>
          <button id="${prevId}">Previous</button>
          <span id="${sceneId}">1 / ${replay.length}</span>
          <button id="${nextId}">Next</button>
        </div>
        <div>
          <button id="${autoplayId}">Auto Play</button>
        </div>
        `
      )
    )
  )
  
  const ui = () => el.nav(route, true, true)
  
  return ui()
}
module.exports = watch
