import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { clearWarnings } from "../../utils/warnings";
import { sendModLog } from "../../utils/modlog";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("clearwarns")
    .setDescription("Clear all warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to clear warnings for").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const moderator = interaction.user;
    const cleared = clearWarnings(interaction.guild.id, targetUser.id);

    if (cleared === 0) {
      await interaction.reply({
        content: `${targetUser.tag} has no warnings to clear.`,
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle("🧹 Warnings Cleared")
      .addFields(
        { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
        { name: "Moderator", value: moderator.tag, inline: true },
        { name: "Warnings Removed", value: `${cleared}`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    await sendModLog(interaction.client, {
      action: "CLEAR_WARNS",
      moderator: { id: moderator.id, tag: moderator.tag },
      target: { id: targetUser.id, tag: targetUser.tag },
      reason: `Cleared ${cleared} warning(s)`,
    });
  },
};

export default command;
