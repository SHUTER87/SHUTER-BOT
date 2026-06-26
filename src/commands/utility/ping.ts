import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import type { Command } from "../../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the bot's latency and status"),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.deferReply({ fetchReply: true });
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    const ws = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("🏓 Pong!")
      .addFields(
        { name: "Roundtrip", value: `${roundtrip}ms`, inline: true },
        { name: "WebSocket", value: `${ws}ms`, inline: true },
        { name: "Status", value: ws < 100 ? "🟢 Excellent" : ws < 200 ? "🟡 Good" : "🔴 High latency", inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
