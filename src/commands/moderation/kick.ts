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
    .setName("kick")
    .setDescription("Kick a member from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to kick").setRequired(true)
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason for the kick").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const moderator = interaction.user;

    const targetMember = interaction.guild.members.cache.get(targetUser.id) as GuildMember | undefined;

    if (!targetMember) {
      await interaction.reply({ content: "That user is not in this server.", ephemeral: true });
      return;
    }

    if (!targetMember.kickable) {
      await interaction.reply({ content: "I cannot kick this user. They may have a higher role than me.", ephemeral: true });
      return;
    }

    if (targetMember.id === moderator.id) {
      await interaction.reply({ content: "You cannot kick yourself.", ephemeral: true });
      return;
    }

    try {
      await targetMember.kick(`[SHUTER] ${moderator.tag}: ${reason}`);

      const embed = new EmbedBuilder()
        .setColor(0xe67e22)
        .setTitle("👢 User Kicked")
        .addFields(
          { name: "User", value: `${targetUser.tag} (${targetUser.id})`, inline: true },
          { name: "Moderator", value: moderator.tag, inline: true },
          { name: "Reason", value: reason },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      await sendModLog(interaction.client, {
        action: "KICK",
        moderator: { id: moderator.id, tag: moderator.tag },
        target: { id: targetUser.id, tag: targetUser.tag },
        reason,
      });
    } catch {
      await interaction.reply({ content: "Failed to kick the user. Check my permissions.", ephemeral: true });
    }
  },
};

export default command;
