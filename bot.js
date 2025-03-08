const { Telegraf } = require("telegraf");
const fs = require("fs");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

let users = []; // Use an array instead of Map

// ✅ Load users from JSON file on startup
try {
  users = JSON.parse(fs.readFileSync("users.json", "utf-8")) || [];
} catch (error) {
  console.error("⚠️ Error loading users.json:", error);
}

// ✅ Track users when they send messages
bot.on("message", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;

    console.log(`📩 Message received from ${username} (${userId})`);

    if (!users.some((u) => u.id === userId)) {
      users.push({ id: userId, username });
      console.log(`✅ User added: ${username} (${userId})`);
      fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
    }
  } catch (error) {
    console.error("❌ Error handling message:", error);
  }
});


// ✅ Track users when they join the group
bot.on("new_chat_members", async (ctx) => {
  try {
    ctx.message.new_chat_members.forEach((member) => {
      const userId = member.id;
      const username = member.username || member.first_name;

      if (!users.some((u) => u.id === userId)) {
        users.push({ id: userId, username });
        console.log(`User joined: ${username} (${userId})`);

        // Save users to JSON file
        fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
        console.log("✅ Users successfully saved to users.json!");
      }
    });
  } catch (error) {
    console.error("❌ Error handling new member:", error);
  }
});

// ✅ List Users Command
bot.command("list", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can view the user list!");

  console.log("🛠 DEBUG: Current users in list:", users);

  if (users.length === 0) {
    return ctx.reply("❌ No users recorded yet.");
  }

  let response = "📜 **Group Members:**\n\n";
  users.forEach((user) => {
    response += `- [${user.username}](tg://user?id=${user.id})\n`;
  });

  return ctx.reply(response, { parse_mode: "MarkdownV2" });
});

// ✅ Start Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("❌ Error starting bot:", err));
