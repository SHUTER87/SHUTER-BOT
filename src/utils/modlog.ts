import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { config } from "../config";
import { logger } from "./logger";

export type ModAction =
  | "BAN"
  | "UNBAN"
  | "KICK"
  | "TIMEOUT"
  | "WARN"
  | "CLEAR_WARNS"
  | "PURGE";

const COLOR: Record<ModAction, number> = {
  BAN: 0xe74c3c,
  UNBAN: 0x2ecc71,
  KICK: 0xe67e22,
  TIMEOUT: 0xf39c12,
  WARN: 0xf1c40f,
  CLEAR_WARNS: 0x3498db,
  PURGE: 0x9b59b6,
};

export interface ModLogOptions {
  action: ModAction;
  moderator: { id: string; tag: string };
  target: { id: string; tag: string };
  reason?: string;
  extra?: string;
}

export async function sendModLog(client: Client, opts: ModLogOptions): Promise<void> {
  if (!config.logChannelId) return;

  try {
    const channel = await client.channels.fetch(config.logChannelId);
    if (!(channel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
      .setColor(COLOR[opts.action])
      .setTitle(`🔨 ${opts.action}`)
      .addFields(
        { name: "Target", value: `<@${opts.target.id}> (${opts.target.tag})`, inline: true },
        { name: "Moderator", value: `<@${opts.moderator.id}> (${opts.moderator.tag})`, inline: true },
        { name: "Reason", value: opts.reason ?? "No reason provided", inline: false },
      )
      .setTimestamp();

    if (opts.extra) {
      embed.addFields({ name: "Details", value: opts.extra, inline: false });
    }

    await channel.send({ embeds: [embed] });
  } catch (err) {
    logger.error("Failed to send mod log", err);
  }
}
