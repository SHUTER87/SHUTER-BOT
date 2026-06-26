import { Client, Interaction } from "discord.js";
import { logger } from "../utils/logger";

export default function register(client: Client): void {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      logger.warn(`Unknown command received: ${interaction.commandName}`);
      await interaction.reply({ content: "Unknown command.", ephemeral: true });
      return;
    }

    try {
      logger.info(`[${interaction.guild?.name ?? "DM"}] ${interaction.user.tag} used /${interaction.commandName}`);
      await command.execute(interaction);
    } catch (err) {
      logger.error(`Error executing command /${interaction.commandName}`, err);
      const msg = { content: "An error occurred while executing that command.", ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(msg).catch(() => undefined);
      } else {
        await interaction.reply(msg).catch(() => undefined);
      }
    }
  });
}
