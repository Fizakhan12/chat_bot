const { Telegraf } = require("telegraf");
const fs = require("fs");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const admins = [5303351099]; // Replace with actual admin IDs

let links = [];
let users = [];

// ✅ Load existing links from file
try {
  links = JSON.parse(fs.readFileSync("links.json", "utf-8")) || [];
} catch (error) {
  console.error("⚠️ Error loading links.json:", error);
}

// ✅ Load users from JSON file
try {
  users = JSON.parse(fs.readFileSync("users.json", "utf-8")) || [];
} catch (error) {
  console.error("⚠️ Error loading users.json:", error);
}

// ✅ Admin Command: Count Links (on /start)
bot.command("start", async (ctx) => {
  if (!admins.includes(ctx.from.id)) {
    return ctx.reply("❌ Only admins can use this command!");
  }

  const linkCount = links.length;
  // ctx.reply(`📊 Total links recorded: ${linkCount}`);
});

// ✅ User Command: Get Total Link Count (on /total)
bot.command("total", async (ctx) => {
  const linkCount = links.length;
  ctx.reply(`📊 Total links recorded: ${linkCount}`);
});

// ✅ Track text messages for links
bot.on("text", async (ctx) => {
  try {
    const messageText = ctx.message.text;
    const urlRegex = /(https?:\/\/[^\s]+)/g; // Detects links

    const foundLinks = messageText.match(urlRegex);
    if (foundLinks) {
      links.push(...foundLinks);
      fs.writeFileSync("links.json", JSON.stringify(links, null, 2));
      console.log(`🔗 Links added: ${foundLinks.length}`);
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
    response += `- [${user.username}](tg://user?id=${user.id})\n`;
  });

  return ctx.reply(response, { parse_mode: "MarkdownV2" });
});

// ✅ Test Command
bot.command("test", async (ctx) => {
  ctx.reply("✅ Bot is working!");
});

// ✅ Start Bot
bot.launch()
  .then(() => console.log("🤖 Telegram Bot is running..."))
  .catch((err) => console.error("❌ Error starting bot:", err));
