const mineflayer = require('mineflayer')

// Suppress punycode deprecation warning (common in recent Node versions)
process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return
  }
  console.warn(warning)
})

// ──────────────────────────────────────────────
// CONFIGURATION – CHANGE THESE VALUES AS NEEDED
// ──────────────────────────────────────────────
const CONFIG = {
  host: 'noblockcg.aternos.me',
  port: 55696,
  username: 'MyCoolBot',           // ← change this name if you want
  version: '1.21',                 // ← MUST MATCH your Aternos server version exactly
                                   //    (check Aternos dashboard: e.g. '1.20.6', '1.21.1', '1.20.4')
  auth: 'offline'                  // 'offline' = cracked server
                                   // 'microsoft' = premium account (needs login on first run)
}

// ──────────────────────────────────────────────
// RECONNECT CONTROL
// ──────────────────────────────────────────────
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10
const RECONNECT_DELAY_MS = 8000   // 8 seconds – gives Aternos time to stabilize

// ──────────────────────────────────────────────
// CREATE BOT FUNCTION (called on start + reconnect)
// ──────────────────────────────────────────────
function createBotInstance() {
  console.log(`[Bot] Creating new instance (attempt ${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`)

  const bot = mineflayer.createBot({
    host: CONFIG.host,
    port: CONFIG.port,
    username: CONFIG.username,
    version: CONFIG.version,
    auth: CONFIG.auth,
    keepAlive: true,
    checkTimeoutInterval: 60000,   // 60 seconds
    connectTimeout: 30000          // 30 seconds
  })

  // ──────────────────────────────────────────────
  // EVENTS
  // ──────────────────────────────────────────────
  bot.once('spawn', () => {
    console.log(`[Bot] ${bot.username} joined the server successfully!`)
    bot.chat('Hello! Bot is here 👋')

    // ─── Anti-AFK loop ───────────────────────────
    setInterval(() => {
      if (!bot.entity) return

      // Random look around
      const yaw   = Math.random() * Math.PI * 2 - Math.PI
      const pitch = (Math.random() - 0.5) * Math.PI / 2
      bot.look(yaw, pitch, true)

      // Random jump (≈30% chance)
      if (Math.random() < 0.3) {
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 150)
      }

      console.log('[Anti-AFK] Looked around' + (Math.random() < 0.3 ? ' + jumped' : ''))
    }, 25000 + Math.random() * 15000)   // 25–40 seconds interval
  })

  // Chat – protected against bad packets
  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    try {
      console.log(`[${username}] ${message}`)

      if (message.toLowerCase() === 'hi') {
        bot.chat(`Hi ${username}! 😄`)
      } else if (message.toLowerCase().includes('follow')) {
        bot.chat("I'd love to follow, but I need pathfinder plugin for that!")
      }
    } catch (err) {
      console.error('[Chat error – ignored bad packet]', err.message)
    }
  })

  bot.on('kicked', (reason) => {
    let reasonStr = typeof reason === 'string' ? reason : JSON.stringify(reason)
    console.log(`[Kicked] ${reasonStr}`)
  })

  bot.on('error', (err) => {
    console.error('[Error]', err.message)
    if (err.stack) console.error(err.stack.split('\n').slice(0,6).join('\n'))
  })

  bot.on('end', (reason) => {
    let reasonStr = reason || 'no reason provided'
    console.log(`[Disconnected] ${reasonStr}`)

    reconnectAttempts++
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.log(`Max reconnect attempts reached (${MAX_RECONNECT_ATTEMPTS}). Stopping.`)
      return
    }

    setTimeout(() => {
      console.log(`Reconnecting in ${RECONNECT_DELAY_MS / 1000} seconds...`)
      createBotInstance()
    }, RECONNECT_DELAY_MS)
  })

  return bot
}

// ──────────────────────────────────────────────
// START
// ──────────────────────────────────────────────
console.log('Minecraft bot starting...')
createBotInstance()
