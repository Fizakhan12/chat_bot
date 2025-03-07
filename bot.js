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
const bannedUsers = new Set();

bot.command("ban", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can ban users!");

  const userToBan = ctx.message.reply_to_message?.from?.id;
  if (!userToBan) return ctx.reply("⚠️ Reply to a user's message to ban them.");

  bannedUsers.add(userToBan);
  return ctx.reply(`🚫 User [${userToBan}](tg://user?id=${userToBan}) is now banned (simulated).`, { parse_mode: "Markdown" });
});

bot.on("text", async (ctx) => {
  if (bannedUsers.has(ctx.from.id)) {
    return ctx.reply("❌ You are banned! (Simulation)");
  }
});



// Mute User
const mutedUsers = new Set();

bot.command("mute", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can mute users!");

  const userToMute = ctx.message.reply_to_message?.from?.id;
  if (!userToMute) return ctx.reply("⚠️ Reply to a user's message to mute them.");

  mutedUsers.add(userToMute);
  return ctx.reply(`🔇 User [${userToMute}](tg://user?id=${userToMute}) is now muted (simulated).`, { parse_mode: "Markdown" });
});

bot.on("text", async (ctx) => {
  if (mutedUsers.has(ctx.from.id)) {
    return; // Ignore their messages instead of muting (since real mute only works in supergroups)
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
    // Fetch recent messages (limit 100)
    const messages = await ctx.telegram.getChatHistory(ctx.chat.id, {
      limit: 100,
    });

    // Loop through messages and delete them
    for (const msg of messages) {
      await ctx.telegram.deleteMessage(ctx.chat.id, msg.message_id);
    }

    await ctx.reply("✅ Chat cleared successfully.");
  } catch (error) {
    console.error("Error clearing chat:", error);
    await ctx.reply("❌ Failed to clear chat. Make sure I have delete permissions.");
  }
});




// Start Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("Error starting bot:", err));
