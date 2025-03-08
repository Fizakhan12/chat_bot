const { Telegraf } = require("telegraf");
const fs = require("fs");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

let linkUsers = []; // Array to store users who sent links

// ✅ Load link users from JSON file on startup
try {
  linkUsers = JSON.parse(fs.readFileSync("link_users.json", "utf-8")) || [];
} catch (error) {
  console.error("⚠️ Error loading link_users.json:", error);
}

// ✅ Detect Messages Containing Links
bot.on("message", async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || ctx.from.first_name;
    const messageText = ctx.message.text || "";

    // Regular expression to detect links
    const linkRegex = /(https?:\/\/[^\s]+)/g;

    if (linkRegex.test(messageText)) {
      console.log(`🔗 Link detected from ${username} (${userId})`);

      if (!linkUsers.some((u) => u.id === userId)) {
        linkUsers.push({ id: userId, username });
        fs.writeFileSync("link_users.json", JSON.stringify(linkUsers, null, 2));
        console.log(`✅ User added: ${username} (${userId})`);
      }
    }
  } catch (error) {
    console.error("❌ Error handling message:", error);
  }
});

// ✅ Command to List Users Who Sent Links
bot.command("list_links", async (ctx) => {
  if (!admins.includes(ctx.from.id)) return ctx.reply("❌ Only admins can view this list!");

  console.log("🛠 DEBUG: Users who sent links:", linkUsers);

  if (linkUsers.length === 0) {
    return ctx.reply("❌ No users have sent links yet.");
  }

  let response = "🔗 **Users Who Sent Links:**\n\n";
  linkUsers.forEach((user) => {
    response += `- [${user.username}](tg://user?id=${user.id})\n`;
  });

  return ctx.reply(response, { parse_mode: "MarkdownV2" });
});

// ✅ Start the Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("❌ Error starting bot:", err));
