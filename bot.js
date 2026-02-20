const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')

// Suppress warnings
process.removeAllListeners('warning')

const CONFIG = {
  host: 'noblockcg.aternos.me',
  port: 55696,
  username: 'MyCoolBot',
  version: '1.21.11',  // ← EXACT Aternos version!
  auth: 'offline'
}

let reconnectAttempts = 0
const MAX_RECONNECTS = 10

function createBot() {
  const bot = mineflayer.createBot(CONFIG)
  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    console.log('Joined! Loading stealth...')
    const mcData = require('minecraft-data')(bot.version)
    const defaultMove = new Movements(bot, mcData)
    bot.pathfinder.setMovements(defaultMove)

    // Initial random wander (human-like)
    bot.pathfinder.setGoal(new GoalNear(bot.entity.position.x + (Math.random()-0.5)*10, bot.entity.position.y, bot.entity.position.z + (Math.random()-0.5)*10, 3))

    // Stealth Anti-AFK: Irregular actions
    const antiAFK = () => {
      if (!bot.entity) return
      // Random look
      bot.look(Math.random()*Math.PI*2, (Math.random()-0.5)*Math.PI/2)
      // Random sneak/jump (SONAR bypass style)
      if (Math.random() < 0.4) {
        bot.setControlState('sneak', true)
        setTimeout(() => bot.setControlState('sneak', false), 400 + Math.random()*200)
      }
      if (Math.random() < 0.2) {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 150)
      }
      // Random self-chat (1% chance)
      if (Math.random() < 0.01) setTimeout(() => bot.chat('thinking...'), 200 + Math.random()*500)
    }
    setInterval(antiAFK, 20000 + Math.random()*25000)  // 20-45s irregular

    bot.chat('Hey everyone!')  // Delayed join msg
  })

  bot.on('chat', (u, m) => {
    setTimeout(() => {  // Human delay
      if (m.toLowerCase() === 'hi') bot.chat('Hi!')
    }, 300 + Math.random()*700)
  })

  bot.on('end', () => {
    reconnectAttempts++
    if (reconnectAttempts < MAX_RECONNECTS) {
      setTimeout(createBot, 5000 * Math.pow(1.5, reconnectAttempts))  // Backoff
    }
  })

  return bot
}

createBot()
