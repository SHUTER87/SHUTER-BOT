import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import type { Command } from "../../types";
import { getWarnings } from "../../utils/warnings";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View warnings for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((opt) =>
      opt.setName("user").setDescription("The user to check").setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) {
      await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser("user", true);
    const warnings = getWarnings(interaction.guild.id, targetUser.id);

    if (warnings.length === 0) {
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setDescription(`✅ **${targetUser.tag}** has no warnings.`)
            .setTimestamp(),
        ],
        ephemeral: true,
      });
      return;
    }

    const fields = warnings.map((w, i) => ({
      name: `Warning #${i + 1} — <t:${Math.floor(w.timestamp.getTime() / 1000)}:d>`,
      value: `**Reason:** ${w.reason}\n**Moderator:** <@${w.moderatorId}>`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`⚠️ Warnings for ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(fields)
      .setFooter({ text: `${warnings.length} warning(s) total` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

export default command;
