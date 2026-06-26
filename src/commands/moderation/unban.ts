import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { sendModLog } from "../../utils/modlog";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user by their ID")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption((opt) =>
      opt.setName("user_id").setDescription("The user ID to unban").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the unban").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const userId = interaction.options.getString("user_id", true).trim();
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const moderator = interaction.user;

    if (!/^\d{17,19}$/.test(userId)) {
      await interaction.reply({ content: "That doesn't look like a valid user ID.", ephemeral: true });
      return;
    }

    try {
      const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
      if (!ban) {
        await interaction.reply({ content: "That user is not banned in this server.", ephemeral: true });
        return;
      }

      await interaction.guild.members.unban(userId, `[SHUTER] ${moderator.tag}: ${reason}`);

      const embed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("✅ User Unbanned")
        .addFields(
          { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: true },
          { name: "Moderator", value: moderator.tag, inline: true },
          { name: "Reason", value: reason },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModLog(interaction.client, {
        action: "UNBAN",
        moderator: { id: moderator.id, tag: moderator.tag },
        target: { id: ban.user.id, tag: ban.user.tag },
        reason,
      });
    } catch {
      await interaction.reply({ content: "Failed to unban the user. Make sure the ID is correct.", ephemeral: true });
    }
  },
};

export default command;
