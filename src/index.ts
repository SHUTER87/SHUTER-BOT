import { Client, Collection, GatewayIntentBits } from "discord.js";
import { config } from "./config";
import { logger } from "./utils/logger";
import type { Command } from "./types";

import ban from "./commands/moderation/ban";
import kick from "./commands/moderation/kick";
import timeout from "./commands/moderation/timeout";
import warn from "./commands/moderation/warn";
import warnings from "./commands/moderation/warnings";
import clearwarns from "./commands/moderation/clearwarns";
import purge from "./commands/moderation/purge";
import unban from "./commands/moderation/unban";
import ping from "./commands/utility/ping";
import userinfo from "./commands/utility/userinfo";

import registerReady from "./events/ready";
import registerInteractionCreate from "./events/interactionCreate";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
  ],
});

client.commands = new Collection<string, Command>();

const commands: Command[] = [
  ban,
  kick,
  timeout,
  warn,
  warnings,
  clearwarns,
  purge,
  unban,
  ping,
  userinfo,
];

for (const command of commands) {
  const name = (command.data as { name: string }).name;
  client.commands.set(name, command);
  logger.info(`Loaded command: /${name}`);
}

registerReady(client);
registerInteractionCreate(client);

process.on("unhandledRejection", (err) => {
  logger.error("Unhandled rejection", err);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down");
  client.destroy();
  process.exit(0);
});

logger.info("SHUTER MODERATION BOT starting...");
client.login(config.token).catch((err: unknown) => {
  logger.error("Failed to log in. Is your DISCORD_TOKEN correct?", err);
  process.exit(1);
});
