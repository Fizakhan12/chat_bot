const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

const messageHistory = new Map(); // Store message IDs for clearing later

// Handle Messages (Without AI Reply)
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const botId = (await bot.telegram.getMe()).id;

    if (userId === botId) return; // Ignore bot's own messages

    const message = ctx.message.text.toLowerCase();

    if (message.includes("spam")) {
      await ctx.deleteMessage();
      return ctx.reply("❌ Spam detected! Message removed.");
    }

    // Store messages for clearing
    if (!messageHistory.has(ctx.chat.id)) {
      messageHistory.set(ctx.chat.id, []);
    }
    messageHistory.get(ctx.chat.id).push(ctx.message.message_id);

  } catch (error) {
    console.error("Error handling message:", error);
  }
});

// Ban User
bot.command("ban", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can ban users!");
    if (!ctx.message.reply_to_message) return ctx.reply("⚠️ Reply to a user’s message to ban them.");

    const userToBan = ctx.message.reply_to_message.from.id;
    await ctx.telegram.banChatMember(ctx.chat.id, userToBan);
    await ctx.reply(`🚫 User ${userToBan} has been banned.`);
  } catch (error) {
    console.error("Error banning user:", error);
  }
});

// Mute User
bot.command("mute", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can mute users!");
    const userToMute = ctx.message.reply_to_message?.from?.id;
    if (!userToMute) return ctx.reply("⚠️ Reply to a user’s message to mute them.");

    await ctx.telegram.restrictChatMember(ctx.chat.id, userToMute, {
      permissions: { can_send_messages: false },
    });

    await ctx.reply(`🔇 User ${userToMute} has been muted.`);
  } catch (error) {
    console.error("Error muting user:", error);
  }
});

// Unmute User
bot.command("unmute", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can unmute users!");
    const userToUnmute = ctx.message.reply_to_message?.from?.id;
    if (!userToUnmute) return ctx.reply("⚠️ Reply to a user’s message to unmute them.");

    await ctx.telegram.restrictChatMember(ctx.chat.id, userToUnmute, {
      permissions: { can_send_messages: true },
    });

    await ctx.reply(`🔊 User ${userToUnmute} has been unmuted.`);
  } catch (error) {
    console.error("Error unmuting user:", error);
  }
});

// Clear Chat Command for Admins
bot.command("clear", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can clear chat!");

    const chatId = ctx.chat.id;
    const messagesToDelete = messageHistory.get(chatId) || [];

    for (const messageId of messagesToDelete) {
      try {
        await ctx.telegram.deleteMessage(chatId, messageId);
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    }

    messageHistory.set(chatId, []); // Reset history after deletion
    await ctx.reply("🗑️ Chat history cleared.");
  } catch (error) {
    console.error("Error clearing chat:", error);
  }
});

// Start Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("Error starting bot:", err));
