import { Client, ActivityType } from "discord.js";
import { logger } from "../utils/logger";

export default function register(client: Client): void {
  client.once("clientReady", (c) => {
    logger.success(`Logged in as ${c.user.tag}`);
    logger.info(`Serving ${c.guilds.cache.size} guild(s)`);

    c.user.setPresence({
      activities: [{ name: "the server | /help", type: ActivityType.Watching }],
      status: "online",
    });
  });
}
