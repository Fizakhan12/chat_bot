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

bot.command("ban", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can ban users!");

    if (!ctx.message.reply_to_message) return ctx.reply("⚠️ Reply to a user’s message to ban them.");

    const userToBan = ctx.message.reply_to_message.from.id;

    await ctx.telegram.banChatMember(ctx.chat.id, userToBan);
    await ctx.reply(`🚫 User ${userToBan} has been banned.`);
  } catch (error) {
    console.error("Error banning user:", error);
    ctx.reply("❌ An error occurred while trying to ban the user.");
  }
});

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
    const messageCount = 50; // Number of messages to delete (adjust as needed)

    const messages = await ctx.telegram.getChatHistory(chatId, { limit: messageCount });

    for (const message of messages) {
      try {
        await ctx.telegram.deleteMessage(chatId, message.message_id);
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    }

    await ctx.reply("🗑️ Chat history cleared.");
  } catch (error) {
    console.error("Error clearing chat:", error);
    ctx.reply("❌ An error occurred while clearing the chat.");
  }
});

// Start Bot with Error Handling
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("Error starting bot:", err));
