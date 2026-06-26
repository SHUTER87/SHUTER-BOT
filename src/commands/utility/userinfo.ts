import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import type { Command } from "../../types";
import { getWarnings } from "../../utils/warnings";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Display information about a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to inspect (defaults to you)").setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user") ?? interaction.user;
    const member = interaction.guild.members.cache.get(targetUser.id) as GuildMember | undefined;
    const warnings = getWarnings(interaction.guild.id, targetUser.id);

    const roles = member
      ? member.roles.cache
          .filter((r) => r.id !== interaction.guild!.id)
          .sort((a, b) => b.position - a.position)
          .map((r) => `<@&${r.id}>`)
          .slice(0, 10)
          .join(" ") || "None"
      : "Not in server";

    const embed = new EmbedBuilder()
      .setColor(member?.displayColor || 0x5865f2)
      .setTitle(`${targetUser.bot ? "🤖 " : ""}${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: "ID", value: targetUser.id, inline: true },
        { name: "Account Created", value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
        { name: "Warnings", value: `${warnings.length}`, inline: true },
      );

    if (member) {
      embed.addFields(
        { name: "Joined Server", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown", inline: true },
        { name: "Nickname", value: member.nickname ?? "None", inline: true },
        { name: "Timed Out", value: member.communicationDisabledUntilTimestamp ? `<t:${Math.floor(member.communicationDisabledUntilTimestamp / 1000)}:R>` : "No", inline: true },
        { name: `Roles (${member.roles.cache.size - 1})`, value: roles, inline: false },
      );
    } else {
      embed.addFields({ name: "Server Status", value: "Not in server", inline: false });
    }

    embed.setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};

export default command;
