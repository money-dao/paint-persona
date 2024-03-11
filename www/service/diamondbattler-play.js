let service = {}
service.battler = {}

const battle = (d1, d2) => {
  const d1Stats = toStats(d1)
  const d2Stats = toStats(d2)
  console.log('start battle', d1Stats, d2Stats)
  const reports = [round(d1Stats, d2Stats)]
  while(!reports[reports.length - 1].que[reports[reports.length - 1].que.length - 1].winner){
    reports.push(round(d1Stats, d2Stats))
  }
  console.log('battle finished', reports)
  return {reports, players: [d1Stats, d2Stats]}
}

const round = (d1Stats, d2Stats) => {
  console.log('start round')
  let report = {}
  const que = []
  const abilities = [
    [...d1Stats.abilities.map(a => {return {i: 1, ...a}})], 
    [...d2Stats.abilities.map(a => {return {i: 2, ...a}})]
  ]

  //reset armor
  d1Stats.armor = 0
  d2Stats.armor = 0
  const d1ArmorRolls = d1Stats.protection.map(die => Math.ceil((Math.random() * die) + 0.01))
  const d2ArmorRolls = d2Stats.protection.map(die => Math.ceil((Math.random() * die) + 0.01))
  d1Stats.armor = d1ArmorRolls.reduce((a,b) => a + b, 0)
  d2Stats.armor = d2ArmorRolls.reduce((a,b) => a + b, 0) 
  report.d1ArmorRolls = d1ArmorRolls
  report.d2ArmorRolls = d2ArmorRolls
  report.armor = [d1Stats.armor, d2Stats.armor]
  console.log('round hp', d1Stats.hp, d2Stats.hp)
  console.log('round armor', ...report.armor)

  //reset que
  report.speed = []
  console.log('start round que...')
  while(abilities[0].length || abilities[1].length){
    const ability1 = r(abilities[0])
    const ability2 = r(abilities[1])
    if(ability1 && ability2){
      const speed1 = d1Stats.speed
      const speed2 = d2Stats.speed
      const randomSpeed = speed1 + speed2
      const value = Math.ceil((Math.random() * randomSpeed) + 0.01)
      if(value < speed1) {
        que.push(ability1)
        abilities[0].splice(abilities[0].indexOf(ability1), 1)
        report.speed.push({i: 1, speed1, speed2, randomSpeed, value, name: ability1.name})
      }
      else {
        que.push(ability2)
        abilities[1].splice(abilities[1].indexOf(ability2), 1)
        report.speed.push({i: 2, speed1, speed2, randomSpeed, value, name: ability2.name})
      }
    } else if(ability1){
      que.push(ability1)
      abilities[0].splice(abilities[0].indexOf(ability1), 1)
      report.speed.push({i: 1, name: ability1.name})
    } else if(ability2){
      que.push(ability2)
      abilities[1].splice(abilities[1].indexOf(ability2), 1)
      report.speed.push({i: 2, name: ability2.name})
    }
  }

  //play que
  report.que = []
  console.log('Start que...')
  que.forEach(queAbility => {
    const info = {name: queAbility.name, i: queAbility.i}
    const attacker = [0, d1Stats, d2Stats][queAbility.i]
    if(attacker.hp <= 0) return false
    const defender = [0, d2Stats, d1Stats][queAbility.i]
    if(defender.hp <= 0) return false
    const value = roll(queAbility.dice)
    info.damage = value
    if(defender.armor > 0) {
      if((value - defender.armor) > 0) defender.hp -= (value - defender.armor)
      defender.armor -= value
      if(defender.armor < 0) defender.armor = 0
      info.armor = defender.armor
    } else {
      defender.hp -= value
    }
    info.stats = [
      {
        hp: d1Stats.hp + 0,
        armor: d1Stats.armor ? d1Stats.armor : 0
      },
      {
        hp: d2Stats.hp + 0,
        armor: d2Stats.armor ? d2Stats.armor : 0
      }
    ]
    if(defender.hp <= 0) {
      info.winner = queAbility.i
      console.log('Winner', queAbility.i)
    }
    report.que.push(info)
    console.log('que turn', info)
  })

  console.log('round finished', report)

  return report
}

const r = array => array[Math.floor(Math.random() * array.length)]
const roll = die => Math.ceil((Math.random() * die) + 0.01)

const toStats = diamond => {
  let gameObj = {hp: 4, speed: 3, armor: 0, protection: [], abilities: []}
  gameObj.info = {
    id: diamond.address.toString(),
    attr: diamond.attributes,
    image: diamond.image,
    name: diamond.name
  }
  diamond.attributes.forEach(attr => {
    const trait = traits[attr.trait_type][attr.value]
    if(trait.hp) gameObj.hp += trait.hp
    if(trait.speed) gameObj.speed += trait.speed
    if(trait.protection) gameObj.protection.push(trait.protection)
    if(trait.ability) gameObj.abilities.push(trait.ability)
  })
  gameObj.info.hp = gameObj.hp + 0
  return gameObj
}

const trait = (hp, speed, protection, ability) => {
  const stats = {}
  if(hp) stats.hp = hp
  if(speed) stats.speed = speed
  if(protection) stats.protection = protection
  if(ability) stats.ability = ability
  
  let res = ''
  if(hp) res += `+${stats.hp} Hp `
  if(speed) res += `+${stats.speed} Speed `
  if(protection) res += `+1d${stats.protection} Protection `
  if(ability) res += `${stats.ability.name}`
  stats.desc = res
  
  return stats
}

const ab = (name, dice) => trait(0,0,0,{name, dice})

const traits = {
  Background: {
    'Green': trait(27, 3),
    'Blue': trait(21, 6),
    'Purple': trait(21, 9),
    'Pink': trait(27, 3),
    'Yellow': trait(15, 12),
    'Orange': trait(15, 9)
  },
  Body: {
    'Gold_Diamond': trait(15, 0, 8),
    'Pink_Heart_Diamond': trait(9, 0, 6),
    'Green_Diamond': trait(9, 0, 4),
    'Rainbow_Complex_Diamond': trait(6, 0, 10),
    'Green_Heart_Diamond': trait(12, 0, 4),
    'Pattern_Blues_Diamond': trait(6, 0, 8),
    'Pattern_Reds_Diamond': trait(3, 0, 12),
    'LightBlue_Diamond': trait(9, 0, 4),
    'Rainbow_Split_Diamond': trait(6, 0, 10)
  },
  Eyes: {
    'Angry': trait(0, 9, 6),
    'Awake': trait(0, 12, 4),
    'Chill': trait(0, 6, 8)
  },
  Hat: {
    'Crown': ab('Royal Tackle', 12),
    'Halo': ab('Divine Push', 10),
    'Shine': ab('Shiney Slap', 8),
    'None': ab('Headbutt', 6)
  },
  Head: {
    'Hair_Drip_LightBlue': ab('Plasma', 8),
    'Hair_Drip_Pink': ab('Chew', 8),
    'Hair_Drip_Green': ab('Slime', 8),
    'None': ab('Vicious Mockery', 4),
    'Mellow_Drip_Purple': ab('Toxic', 6),
    'Shadow': ab('Backstab', 4),
    'Mellow_Drip_LightBlue': ab('Tornado', 6),
    'Mellow_Drip_Green': ab('Gas', 6)
  },
  Mouth: {
    'Gold_Grill': ab('W Rizz', 12),
    'Smoke_Rainbow_Yellow': ab('Grav Hit', 10),
    'Smoke_LightBlue': ab('Spicy Vape', 10),
    'Smoke_Green': ab('White Owl', 10),
    'Smoke_Rainbow_LightBlue': ab('Cross Joint', 10),
    'Smoke_Rainbow_Pink': ab('Torched Bowl', 10),
    'None': ab('Meditation', 8),
    'Tongue_Pink': ab('Politics', 6),
    'Shadow_Low': ab('Ritual', 8),
    'Smile': ab('Akward Pause', 6),
    'Growl': ab('Embarass', 6),
    'Tongue_Green': ab('Pop Edible', 8)
  },
  Neck: {
    'None': ab('Rock Paper Scissors', 4),
    'Chain': ab('Rap Music', 8)
  }
}

service.battler.toStats = toStats
service.battler.battle = battle
service.battler.traits = traits

module.exports = service.battler
