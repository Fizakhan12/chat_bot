const { Telegraf } = require("telegraf");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

const users = new Map(); // Stores user ID and username

// ✅ Track users when they send messages
bot.on("message", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    if (!users.has(userId)) {
      users.set(userId, username);
      console.log(`User added: ${username} (${userId})`); // Debug log
    }
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

// ✅ List Users Command (Improved Debugging)
bot.command("list", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can view the user list!");

  console.log("🛠 DEBUG: users map content:", users);

  if (users.size === 0) {
    return ctx.reply("❌ No users recorded yet.");
  }

  let response = "📜 **Group Members:**\n\n";
  users.forEach((username, userId) => {
    response += `- [${username}](tg://user?id=${userId})\n`;
  });

  return ctx.reply(response, { parse_mode: "Markdown" });
});

// ✅ Start Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("Error starting bot:", err));
