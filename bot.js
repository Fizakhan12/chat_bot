const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

const bannedUsers = new Set();
const mutedUsers = new Set();
const messageHistory = new Map(); // Store message IDs for clearing later
const users = new Map(); 
// ✅ Handle Messages (Prevent Banned Users from Sending)
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    if (!users.has(userId)) {
      users.set(userId, username); // Store user in map
    }

    if (bannedUsers.has(userId)) {
      await ctx.deleteMessage();
      return;
    }

    if (mutedUsers.has(userId)) {
      return;
    }

    const message = ctx.message.text.toLowerCase();

    if (message.includes("spam")) {
      await ctx.deleteMessage();
      return ctx.reply("❌ Spam detected! Message removed.");
    }

    if (!messageHistory.has(ctx.chat.id)) {
      messageHistory.set(ctx.chat.id, []);
    }
    messageHistory.get(ctx.chat.id).push(ctx.message.message_id);
  } catch (error) {
    console.error("Error handling message:", error);
  }
});


// ✅ Simulated Ban Command
bot.command("ban", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can ban users!");

  const userToBan = ctx.message.reply_to_message?.from?.id;
  if (!userToBan) return ctx.reply("⚠️ Reply to a user's message to ban them.");

  bannedUsers.add(userToBan);
  return ctx.reply(`🚫 User [${userToBan}](tg://user?id=${userToBan}) is now banned (simulated).`, { parse_mode: "Markdown" });
});

// ✅ Simulated Unban Command
bot.command("unban", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can unban users!");

  const userToUnban = ctx.message.reply_to_message?.from?.id;
  if (!userToUnban) return ctx.reply("⚠️ Reply to a user's message to unban them.");

  bannedUsers.delete(userToUnban);
  return ctx.reply(`✅ User [${userToUnban}](tg://user?id=${userToUnban}) has been unbanned.`, { parse_mode: "Markdown" });
});

// ✅ Simulated Mute Command
bot.command("mute", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can mute users!");

  const userToMute = ctx.message.reply_to_message?.from?.id;
  if (!userToMute) return ctx.reply("⚠️ Reply to a user's message to mute them.");

  mutedUsers.add(userToMute);
  return ctx.reply(`🔇 User [${userToMute}](tg://user?id=${userToMute}) is now muted (simulated).`, { parse_mode: "Markdown" });
});

// ✅ Simulated Unmute Command
bot.command("unmute", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can unmute users!");

  const userToUnmute = ctx.message.reply_to_message?.from?.id;
  if (!userToUnmute) return ctx.reply("⚠️ Reply to a user's message to unmute them.");

  mutedUsers.delete(userToUnmute);
  return ctx.reply(`🔊 User [${userToUnmute}](tg://user?id=${userToUnmute}) has been unmuted.`, { parse_mode: "Markdown" });
});
// Fetch user list when `/list` command is used
bot.command("list", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can view the user list!");

  let response = "📜 **Group Members:**\n\n";

  if (users.size > 0) {
    users.forEach((username, userId) => {
      response += `- [${username}](tg://user?id=${userId})\n`;
    });
  } else {
    response += "❌ No users recorded yet.";
  }

  return ctx.reply(response, { parse_mode: "Markdown" });
});

// ✅ Clear Chat Command for Admins
bot.command("clear", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can clear chat!");

  try {
    if (!messageHistory.has(ctx.chat.id)) return ctx.reply("⚠️ No messages to clear.");

    const messagesToDelete = messageHistory.get(ctx.chat.id);
    for (const msgId of messagesToDelete) {
      await ctx.telegram.deleteMessage(ctx.chat.id, msgId);
    }

    messageHistory.set(ctx.chat.id, []);
    await ctx.reply("✅ Chat cleared successfully.");
  } catch (error) {
    console.error("Error clearing chat:", error);
    await ctx.reply("❌ Failed to clear chat. Make sure I have delete permissions.");
  }
});

// ✅ Start Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("Error starting bot:", err));
