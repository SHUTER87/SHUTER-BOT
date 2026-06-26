import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { sendModLog } from "../../utils/modlog";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the ban").setRequired(false)
    )
    .addIntegerOption((opt) =>
      opt
        .setName("delete_days")
        .setDescription("Days of messages to delete (0-7)")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const deleteDays = interaction.options.getInteger("delete_days") ?? 0;
    const moderator = interaction.user;

    const targetMember = interaction.guild.members.cache.get(targetUser.id) as GuildMember | undefined;

    if (targetMember) {
      if (!targetMember.bannable) {
        await interaction.reply({ content: "I cannot ban this user. They may have a higher role than me.", ephemeral: true });
        return;
      }
      if (targetMember.id === moderator.id) {
        await interaction.reply({ content: "You cannot ban yourself.", ephemeral: true });
        return;
      }
    }

    try {
      await interaction.guild.members.ban(targetUser.id, {
        reason: `[SHUTER] ${moderator.tag}: ${reason}`,
        deleteMessageSeconds: deleteDays * 86400,
      });

      const embed = new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("🔨 User Banned")
        .addFields(
          { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: "Moderator", value: moderator.tag, inline: true },
          { name: "Reason", value: reason },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModLog(interaction.client, {
        action: "BAN",
        moderator: { id: moderator.id, tag: moderator.tag },
        target: { id: targetUser.id, tag: targetUser.tag },
        reason,
        extra: `Messages deleted: ${deleteDays} day(s)`,
      });
    } catch {
      await interaction.reply({ content: "Failed to ban the user. Check my permissions.", ephemeral: true });
    }
  },
};

export default command;
