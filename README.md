# 6b6t Clan Ad Bot

Automated Minecraft bot for the 6b6t anarchy server that periodically broadcasts clan advertisements in chat.

## Purpose

Deploys one or more Mineflayer bots to the 6b6t Minecraft server that cycle through a configurable list of advertisement messages on a timed interval. Designed for clan recruitment or server propaganda.

## Configuration

Create a `.env` file:

```bash
MC_HOST=play.6b6t.org
MC_PORT=25565
MC_AUTH=offline
MC_VERSION=1.20.1
MC_USERNAME_1=bot_username_1
MC_PASSWORD_1=bot_password_1
MC_USERNAME_2=bot_username_2
MC_PASSWORD_2=bot_password_2
```

Edit `ad-bot.js` to customize:
- `messages` array: list of ad messages to broadcast
- `messageCooldownSeconds`: interval between messages (default 900 seconds / 15 minutes)
- `bots` array: enable/disable multiple bots

## Deployment

```bash
npm install
# Configure .env
node ad-bot.js
```

The bot automatically logs in using `/login <password>` and enters a movement sequence to bypass the lobby. After spawning, it cycles through enabled messages on the configured cooldown. If disconnected, it auto-reconnects after 5 seconds.

## Notes

- Supports up to 2 concurrent bot accounts
- Each bot operates independently with its own message cycle
- Designed specifically for 6b6t's chat format and login flow
