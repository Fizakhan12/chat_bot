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
    const userToBan = ctx.message.reply_to_message?.from?.id;

    if (!userToBan) return ctx.reply("⚠️ Reply to a user’s message to ban them.");

    await ctx.telegram.banChatMember(ctx.chat.id, userToBan);
    await ctx.reply(`🚫 User [${userToBan}](tg://user?id=${userToBan}) has been banned.`, { parse_mode: "Markdown" });
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
      permissions: { can_send_messages: false, can_send_media_messages: false },
      until_date: Math.floor(Date.now() / 1000) + 3600, // Mutes for 1 hour
    });

    await ctx.reply(`🔇 User [${userToMute}](tg://user?id=${userToMute}) has been muted for 1 hour.`, { parse_mode: "Markdown" });
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
      permissions: { can_send_messages: true, can_send_media_messages: true },
    });

    await ctx.reply(`🔊 User [${userToUnmute}](tg://user?id=${userToUnmute}) has been unmuted.`, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Error unmuting user:", error);
  }
});

// Clear Chat Command for Admins
bot.command("clear", async (ctx) => {
  try {
    if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can clear chat!");

    const chatId = ctx.chat.id;
    const messages = messageHistory.get(chatId) || [];

    if (messages.length === 0) return ctx.reply("⚠️ No messages to delete!");

    for (const msgId of messages) {
      try {
        await ctx.telegram.deleteMessage(chatId, msgId);
      } catch (err) {
        console.error("Error deleting message:", err);
      }
    }

    messageHistory.set(chatId, []); // Clear stored messages
    await ctx.reply("🗑️ Chat history cleared.");
  } catch (error) {
    console.error("Error clearing chat:", error);
  }
});



// Start Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("Error starting bot:", err));
