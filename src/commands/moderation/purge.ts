import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { sendModLog } from "../../utils/modlog";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete a number of messages from the current channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((opt) =>
      opt
        .setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((opt) =>
      opt.setName("user").setDescription("Only delete messages from this user").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const amount = interaction.options.getInteger("amount", true);
    const filterUser = interaction.options.getUser("user");
    const channel = interaction.channel as TextChannel;
    const moderator = interaction.user;

    await interaction.deferReply({ ephemeral: true });

    try {
      const messages = await channel.messages.fetch({ limit: amount });
      const toDelete = filterUser
        ? messages.filter((m) => m.author.id === filterUser.id)
        : messages;

      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const deletable = toDelete.filter((m) => m.createdTimestamp > twoWeeksAgo);

      const deleted = await channel.bulkDelete(deletable, true);

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle("🗑️ Messages Purged")
        .addFields(
          { name: "Deleted", value: `${deleted.size} message(s)`, inline: true },
          { name: "Channel", value: `<#${channel.id}>`, inline: true },
          { name: "Moderator", value: moderator.tag, inline: true },
        )
        .setTimestamp();

      if (filterUser) {
        embed.addFields({ name: "Filter", value: `Messages from ${filterUser.tag}`, inline: false });
      }

      await interaction.editReply({ embeds: [embed] });

      await sendModLog(interaction.client, {
        action: "PURGE",
        moderator: { id: moderator.id, tag: moderator.tag },
        target: { id: channel.id, tag: `#${channel.name}` },
        reason: `Purged ${deleted.size} message(s)`,
        extra: filterUser ? `Filtered by user: ${filterUser.tag}` : undefined,
      });
    } catch {
      await interaction.editReply({ content: "Failed to delete messages. Messages older than 14 days cannot be bulk-deleted." });
    }
  },
};

export default command;
