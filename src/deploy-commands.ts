import { REST, Routes } from "discord.js";
import { config } from "./config";
import { logger } from "./utils/logger";

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

const commandData = [
  ban, kick, timeout, warn, warnings, clearwarns, purge, unban, ping, userinfo,
].map((c) => (c.data as { toJSON(): unknown }).toJSON());

const rest = new REST().setToken(config.token);

async function deploy(): Promise<void> {
  try {
    logger.info(`Registering ${commandData.length} application (/) commands...`);

    if (config.guildId) {
      await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
        body: commandData,
      });
      logger.success(`Deployed ${commandData.length} commands to guild ${config.guildId} (instant)`);
    } else {
      await rest.put(Routes.applicationCommands(config.clientId), {
        body: commandData,
      });
      logger.success(`Deployed ${commandData.length} global commands (may take up to 1 hour to propagate)`);
    }
  } catch (err) {
    logger.error("Failed to deploy commands", err);
    process.exit(1);
  }
}

deploy();
