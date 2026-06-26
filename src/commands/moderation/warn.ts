import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { addWarning } from "../../utils/warnings";
import { sendModLog } from "../../utils/modlog";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issue a warning to a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to warn").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the warning").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const moderator = interaction.user;

    if (targetUser.id === moderator.id) {
      await interaction.reply({ content: "You cannot warn yourself.", ephemeral: true });
      return;
    }

    if (targetUser.bot) {
      await interaction.reply({ content: "You cannot warn a bot.", ephemeral: true });
      return;
    }

    const totalWarnings = addWarning(interaction.guild.id, targetUser.id, {
      moderatorId: moderator.id,
      moderatorTag: moderator.tag,
      reason,
      timestamp: new Date(),
    });

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle("⚠️ Warning Issued")
      .addFields(
        { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
        { name: "Moderator", value: moderator.tag, inline: true },
        { name: "Total Warnings", value: `${totalWarnings}`, inline: true },
        { name: "Reason", value: reason },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    try {
      await targetUser.send(
        `⚠️ You have received a warning in **${interaction.guild.name}**.\n**Reason:** ${reason}\n**Total warnings:** ${totalWarnings}`
      );
    } catch {
      // DMs may be disabled — not a fatal error
    }

    await sendModLog(interaction.client, {
      action: "WARN",
      moderator: { id: moderator.id, tag: moderator.tag },
      target: { id: targetUser.id, tag: targetUser.tag },
      reason,
      extra: `Total warnings: ${totalWarnings}`,
    });
  },
};

export default command;
