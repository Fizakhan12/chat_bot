const { Telegraf } = require("telegraf");
const fs = require("fs");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

let users = [];

// ✅ Load users from JSON file
try {
  users = JSON.parse(fs.readFileSync("users.json", "utf-8")) || [];
} catch (error) {
  console.error("⚠️ Error loading users.json:", error);
}

// ✅ Track text messages
bot.on("text", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    console.log(`📩 Message received from ${username} (${userId})`);

    if (!users.some((u) => u.id === userId)) {
      users.push({ id: userId, username });
      fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
      console.log(`✅ User added: ${username} (${userId})`);
    }
  } catch (error) {
    console.error("❌ Error handling message:", error);
  }
});

// ✅ Track when users join the group
bot.on("new_chat_members", async (ctx) => {
  try {
    ctx.message.new_chat_members.forEach((member) => {
      const userId = member.id;
      const username = member.username || member.first_name;

      if (!users.some((u) => u.id === userId)) {
        users.push({ id: userId, username });
        fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
        console.log(`✅ User joined: ${username} (${userId})`);
      }
    });
  } catch (error) {
    console.error("❌ Error handling new member:", error);
  }
});

// ✅ List Users Command
bot.command("list", async (ctx) => {
  if (!admins.includes(ctx.from.id)) {
    return ctx.reply("❌ Only admins can view the user list!");
  }

  console.log("🛠 DEBUG: Current users in list:", users);

  if (users.length === 0) {
    return ctx.reply("❌ No users recorded yet.");
  }

  let response = "📜 *Group Members:*\n\n";
  users.forEach((user) => {
    const username = user.username.replace(/[_*[\]()~`>#+-=|{}.!]/g, "\\$&"); // Escape MarkdownV2 characters
    response += `- [${username}](tg://user?id=${user.id})\n`;
  });

  return ctx.reply(response, { parse_mode: "MarkdownV2" });
});

bot.command("test", async (ctx) => {
  ctx.reply("✅ Bot is working!");
});
// ✅ Start Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("❌ Error starting bot:", err));

