const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

const bannedUsers = new Set();
const mutedUsers = new Set();
const messageHistory = new Map(); // Store message IDs for clearing later
const users = new Map(); // Stores user IDs and usernames

// ✅ Track users when they send messages
bot.on("message", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    if (!users.has(userId)) {
      users.set(userId, username);
      console.log(`User added: ${username} (${userId})`); // Debug log
    }

    if (bannedUsers.has(userId)) {
      await ctx.deleteMessage();
      return;
    }

    if (mutedUsers.has(userId)) {
      return;
    }

    const message = ctx.message.text?.toLowerCase() || "";

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

// ✅ Track users when they join the group
bot.on("new_chat_members", async (ctx) => {
  try {
    ctx.message.new_chat_members.forEach((member) => {
      const userId = member.id;
      const username = member.username || member.first_name;

      if (!users.has(userId)) {
        users.set(userId, username);
        console.log(`User joined: ${username} (${userId})`); // Debug log
      }
    });
  } catch (error) {
    console.error("Error handling new member:", error);
  }
});

// ✅ Ban Command
bot.command("ban", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can ban users!");

  const userToBan = ctx.message.reply_to_message?.from?.id;
  if (!userToBan) return ctx.reply("⚠️ Reply to a user's message to ban them.");

  bannedUsers.add(userToBan);
  return ctx.reply(`🚫 User [${userToBan}](tg://user?id=${userToBan}) is now banned (simulated).`, { parse_mode: "Markdown" });
});

// ✅ Unban Command
bot.command("unban", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can unban users!");

  const userToUnban = ctx.message.reply_to_message?.from?.id;
  if (!userToUnban) return ctx.reply("⚠️ Reply to a user's message to unban them.");

  bannedUsers.delete(userToUnban);
  return ctx.reply(`✅ User [${userToUnban}](tg://user?id=${userToUnban}) has been unbanned.`, { parse_mode: "Markdown" });
});

// ✅ Mute Command
bot.command("mute", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can mute users!");

  const userToMute = ctx.message.reply_to_message?.from?.id;
  if (!userToMute) return ctx.reply("⚠️ Reply to a user's message to mute them.");

  mutedUsers.add(userToMute);
  return ctx.reply(`🔇 User [${userToMute}](tg://user?id=${userToMute}) is now muted (simulated).`, { parse_mode: "Markdown" });
});

// ✅ Unmute Command
bot.command("unmute", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can unmute users!");

  const userToUnmute = ctx.message.reply_to_message?.from?.id;
  if (!userToUnmute) return ctx.reply("⚠️ Reply to a user's message to unmute them.");

  mutedUsers.delete(userToUnmute);
  return ctx.reply(`🔊 User [${userToUnmute}](tg://user?id=${userToUnmute}) has been unmuted.`, { parse_mode: "Markdown" });
});

// ✅ List Users Command
bot.command("list", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can view the user list!");

  console.log("User Map:", users); // Debugging log

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

// ✅ Clear Chat Command
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
