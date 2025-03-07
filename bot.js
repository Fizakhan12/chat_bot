const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

// Handle Spam Messages
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const botId = (await bot.telegram.getMe()).id; // Get bot's own ID

    if (userId === botId) return; // Ignore bot's own messages

    const message = ctx.message.text.toLowerCase();

    if (message.includes("spam")) {
      await ctx.deleteMessage();
      return ctx.reply("❌ Spam detected! Message removed.");
    }

    // Prevent repeating user messages, add a generic AI response instead
    if (!message.includes("ban") && !message.includes("mute")) {
      await ctx.reply("🤖 AI is here! How can I assist you?");
    }

  } catch (error) {
    console.error("Error handling message:", error);
  }
});

// Admin Commands
bot.command("ban", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can ban users!");

    const userToBan = ctx.message.reply_to_message?.from?.id;
    if (!userToBan) return ctx.reply("⚠️ Reply to a user’s message to ban them.");

    await ctx.banChatMember(userToBan);
    await ctx.reply(`🚫 User ${userToBan} has been banned.`);
  } catch (error) {
    console.error("Error banning user:", error);
  }
});

bot.command("mute", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can mute users!");

    const userToMute = ctx.message.reply_to_message?.from?.id;
    if (!userToMute) return ctx.reply("⚠️ Reply to a user’s message to mute them.");

    await ctx.restrictChatMember(userToMute, { permissions: { can_send_messages: false } });
    await ctx.reply(`🔇 User ${userToMute} has been muted.`);
  } catch (error) {
    console.error("Error muting user:", error);
  }
});

bot.command("unmute", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can unmute users!");

    const userToUnmute = ctx.message.reply_to_message?.from?.id;
    if (!userToUnmute) return ctx.reply("⚠️ Reply to a user’s message to unmute them.");

    await ctx.restrictChatMember(userToUnmute, { permissions: { can_send_messages: true } });
    await ctx.reply(`🔊 User ${userToUnmute} has been unmuted.`);
  } catch (error) {
    console.error("Error unmuting user:", error);
  }
});

// Start Bot with Error Handling
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("Error starting bot:", err));
