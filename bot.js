// const { Telegraf } = require("telegraf");
// const fs = require("fs");
// require("dotenv").config();

// const bot = new Telegraf(process.env.BOT_TOKEN);
// const admins = [5303351099]; // Replace with actual admin IDs
// let ownerId = null; // ✅ Store owner ID dynamically

// let links = [];
// let users = [];
// let countingActive = true; // ✅ Flag to enable/disable counting

// // ✅ Load existing links from file
// try {
//   links = JSON.parse(fs.readFileSync("links.json", "utf-8")) || [];
// } catch (error) {
//   console.error("⚠️ Error loading links.json:", error);
// }

// // ✅ Load users from JSON file
// try {
//   users = JSON.parse(fs.readFileSync("users.json", "utf-8")) || [];
// } catch (error) {
//   console.error("⚠️ Error loading users.json:", error);
// }

// // ✅ Function to check if the user is an admin or owner
// const isAuthorized = async (ctx) => {
//   try {
//     const chatAdmins = await ctx.getChatAdministrators();
//     const user = chatAdmins.find((admin) => admin.user.id === ctx.from.id);

//     if (user) {
//       if (user.status === "creator") {
//         ownerId = ctx.from.id; // ✅ Store the owner's ID dynamically
//       }
//       return true; // ✅ User is an admin or owner
//     }
//   } catch (error) {
//     console.error("❌ Error fetching chat administrators:", error);
//   }
//   return false; // ❌ User is not an admin or owner
// };

// // ✅ Admin/Owner Command: Start Counting (on /start)
// bot.command("start", async (ctx) => {
//   if (!(await isAuthorized(ctx))) {
//     return ctx.reply("❌ Only admins or the owner can use this command!");
//   }

//   links = [];
//   countingActive = true;
//   fs.writeFileSync("links.json", JSON.stringify(links, null, 2));

//   ctx.reply("📊 Link counting started!");
// });

// // ✅ Admin/Owner Command: Stop Counting (on /close)
// // ✅ Admin/Owner Command: Stop Counting and Reset Links (on /close)
// bot.command("close", async (ctx) => {
//   if (!(await isAuthorized(ctx))) {
//     return ctx.reply("❌ Only admins or the owner can use this command!");
//   }

//   countingActive = false; // ✅ Stop counting
//   links = []; // ✅ Reset link count
//   fs.writeFileSync("links.json", JSON.stringify(links, null, 2)); // ✅ Update file

//   ctx.reply("⛔ Link counting has been stopped.\n📊 Total links count has been reset to 0.");
// });


// // ✅ User Command: Get Total Link Count (on /total)
// bot.command("total", async (ctx) => {
//   ctx.reply(`📊 Total links recorded: ${links.length}`);
// });

// // ✅ Track text messages for links
// bot.on("text", async (ctx) => {
//   if (!countingActive) return;

//   try {
//     const messageText = ctx.message.text;
//     const urlRegex = /(https?:\/\/[^\s]+)/g;

//     const foundLinks = messageText.match(urlRegex);
//     if (foundLinks) {
//       links.push(...foundLinks);
//       fs.writeFileSync("links.json", JSON.stringify(links, null, 2));
//       console.log(`🔗 Links added: ${foundLinks.length}`);
//     }
//   } catch (error) {
//     console.error("❌ Error handling message:", error);
//   }
// });

// // ✅ Track when users join the group
// bot.on("new_chat_members", async (ctx) => {
//   try {
//     ctx.message.new_chat_members.forEach((member) => {
//       const userId = member.id;
//       const username = member.username || member.first_name;

//       if (!users.some((u) => u.id === userId)) {
//         users.push({ id: userId, username });
//         fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
//         console.log(`✅ User joined: ${username} (${userId})`);
//       }
//     });
//   } catch (error) {
//     console.error("❌ Error handling new member:", error);
//   }
// });

// // ✅ List Users Command
// bot.command("list", async (ctx) => {
//   if (!(await isAuthorized(ctx))) {
//     return ctx.reply("❌ Only admins or the owner can view the user list!");
//   }

//   if (users.length === 0) {
//     return ctx.reply("❌ No users recorded yet.");
//   }

//   let response = "📜 *Group Members:*\n\n";
//   users.forEach((user) => {
//     response += `- [${user.username}](tg://user?id=${user.id})\n`;
//   });

//   return ctx.reply(response, { parse_mode: "MarkdownV2" });
// });

// // ✅ Test Command
// bot.command("test", async (ctx) => {
//   ctx.reply("✅ Bot is working!");
// });

// // ✅ Start Bot
// bot.launch()
//   .then(() => console.log("🤖 Telegram Bot is running..."))
//   .catch((err) => console.error("❌ Error starting bot:", err));
const TelegramBot = require('node-telegram-bot-api');
const token = '7648045365:AAFhXoiwgywJsWSe8m6_s0jfE9dZt0iMleM'; // Replace with your bot token
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Hello, ${msg.from.first_name}! You said: ${msg.text}`);
});
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome to my bot!");
});
bot.sendMessage(chatId, "Choose an option:", {
  reply_markup: {
      inline_keyboard: [
          [{ text: "Google", url: "https://google.com" }],
          [{ text: "Say Hi", callback_data: "say_hi" }]
      ]
  }
});

bot.on("callback_query", (callbackQuery) => {
  const msg = callbackQuery.message;
  if (callbackQuery.data === "say_hi") {
      bot.sendMessage(msg.chat.id, "Hi there!");
  }
});
bot.onText(/\/mute (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = parseInt(match[1]);

  bot.restrictChatMember(chatId, userId, {
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false
  })
  .then(() => bot.sendMessage(chatId, `User ${userId} has been muted.`))
  .catch(err => bot.sendMessage(chatId, `Error: ${err.message}`));
});
bot.onText(/\/unmute (\d+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = parseInt(match[1]);

  bot.restrictChatMember(chatId, userId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true
  })
  .then(() => bot.sendMessage(chatId, `User ${userId} has been unmuted.`))
  .catch(err => bot.sendMessage(chatId, `Error: ${err.message}`));
});


console.log("Telegram bot is running...");
