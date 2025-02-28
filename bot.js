require("dotenv").config();
const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with Telegram Admin IDs

// AI Response (Example: Using OpenAI API)
bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const message = ctx.message.text;

  if (message.toLowerCase().includes("spam")) {
    ctx.deleteMessage();
    ctx.reply("❌ Spam detected! Message removed.");
    return;
  }

  // AI Response (Replace with real API)
  const response = `🤖 AI says: "${message}"`;
  ctx.reply(response);
});

// Admin Commands
bot.command("ban", (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can ban users!");

  const userToBan = ctx.message.reply_to_message?.from?.id;
  if (!userToBan) return ctx.reply("⚠️ Reply to a user’s message to ban them.");

  ctx.banChatMember(userToBan);
  ctx.reply(`🚫 User ${userToBan} has been banned.`);
});

bot.command("mute", (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can mute users!");

  const userToMute = ctx.message.reply_to_message?.from?.id;
  if (!userToMute) return ctx.reply("⚠️ Reply to a user’s message to mute them.");

  ctx.restrictChatMember(userToMute, { can_send_messages: false });
  ctx.reply(`🔇 User ${userToMute} has been muted.`);
});

bot.command("unmute", (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can unmute users!");

  const userToUnmute = ctx.message.reply_to_message?.from?.id;
  if (!userToUnmute) return ctx.reply("⚠️ Reply to a user’s message to unmute them.");

  ctx.restrictChatMember(userToUnmute, { can_send_messages: true });
  ctx.reply(`🔊 User ${userToUnmute} has been unmuted.`);
});

// Start Bot
bot.launch();
console.log("🤖 Telegram Bot is running...");
