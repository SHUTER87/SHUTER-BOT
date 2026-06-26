import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  GuildMember,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { sendModLog } from "../../utils/modlog";

const DURATION_CHOICES = [
  { name: "60 seconds", value: 60 },
  { name: "5 minutes", value: 300 },
  { name: "10 minutes", value: 600 },
  { name: "30 minutes", value: 1800 },
  { name: "1 hour", value: 3600 },
  { name: "6 hours", value: 21600 },
  { name: "12 hours", value: 43200 },
  { name: "1 day", value: 86400 },
  { name: "3 days", value: 259200 },
  { name: "7 days", value: 604800 },
];

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout (mute) a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to timeout").setRequired(true)
    )
    .addIntegerOption((opt) => {
      const o = opt
        .setName("duration")
        .setDescription("How long to timeout the user")
        .setRequired(true);
      DURATION_CHOICES.forEach((c) => o.addChoices({ name: c.name, value: c.value }));
      return o;
    })
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the timeout").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const durationSeconds = interaction.options.getInteger("duration", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const moderator = interaction.user;

    const targetMember = interaction.guild.members.cache.get(targetUser.id) as GuildMember | undefined;

    if (!targetMember) {
      await interaction.reply({ content: "That user is not in this server.", ephemeral: true });
      return;
    }

    if (!targetMember.moderatable) {
      await interaction.reply({ content: "I cannot timeout this user. They may have a higher role than me.", ephemeral: true });
      return;
    }

    if (targetMember.id === moderator.id) {
      await interaction.reply({ content: "You cannot timeout yourself.", ephemeral: true });
      return;
    }

    try {
      await targetMember.timeout(durationSeconds * 1000, `[SHUTER] ${moderator.tag}: ${reason}`);

      const durationLabel = formatDuration(durationSeconds);
      const until = new Date(Date.now() + durationSeconds * 1000);

      const embed = new EmbedBuilder()
        .setColor(0xf39c12)
        .setTitle("⏱️ User Timed Out")
        .addFields(
          { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: "Moderator", value: moderator.tag, inline: true },
          { name: "Duration", value: durationLabel, inline: true },
          { name: "Expires", value: `<t:${Math.floor(until.getTime() / 1000)}:R>`, inline: true },
          { name: "Reason", value: reason },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModLog(interaction.client, {
        action: "TIMEOUT",
        moderator: { id: moderator.id, tag: moderator.tag },
        target: { id: targetUser.id, tag: targetUser.tag },
        reason,
        extra: `Duration: ${durationLabel} — expires <t:${Math.floor(until.getTime() / 1000)}:R>`,
      });
    } catch {
      await interaction.reply({ content: "Failed to timeout the user. Check my permissions.", ephemeral: true });
    }
  },
};

export default command;
