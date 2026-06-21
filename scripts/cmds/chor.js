const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "chor",
    aliases: ["thief", "chur"],
    version: "1.0.2",
    author: "Joshua Sy", // Original Creator
    countDown: 5,
    role: 0, 
    category: "fun",
    usePrefix: true, 
    description: "Scooby doo mask reveal chor meme",
    guide: "{pn} @mention or reply"
  },

/* --- [ 🔐 MODIFICATION INFORMATION ] ---
 * ⚙️ MODIFIED BY: 𝕸𝖎𝖑𝖔𝖓 
 * 🤖 BOT NAME: ─꯭─⃝͎̽𓆩মিঁলঁনেঁরঁ ফেঁমাঁসঁ বঁটঁ‣᭄𓆪___//😽🩵🪽
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName }) {
    const { body } = event;
    if (!body) return;

    const args = body.toLowerCase().split(" ");
    const prefix = global.GoatBot.config.prefix;

    if (args[0] === "chor" || args[0] === "thief" || args[0] === `${prefix}chor` || args[0] === `${prefix}thief`) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID, mentions, messageReply } = event;

    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      targetID = event.senderID; 
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      message.reply(`🔍 মুরগির খামারে তল্লাশি চালানো হচ্ছে... চোরকে ধরা হয়েছে! ⏳🐔`);

      const imgLink = "https://i.imgur.com/ES28alv.png"; // অরিজিনাল স্কুবি-ডু টেমপ্লেট
      const filePath = path.join(cacheDir, `chor_milon_${Date.now()}.png`);

      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const targetPfpUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      const [baseImage, targetPfp] = await Promise.all([
        loadImage(imgLink),
        loadImage(targetPfpUrl)
      ]);

      const canvas = createCanvas(500, 670); // অরিজিনাল সাইজ
      const ctx = canvas.getContext("2d");

      // ব্যাকগ্রাউন্ড আঁকা
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // প্রোফাইল পিকচার পারফেক্ট মাপ ও পজিশন: (48, 410, 111, 111)
      const pfpWidth = 111;
      const pfpHeight = 111;
      const x = 48;
      const y = 410;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        x + pfpWidth / 2,
        y + pfpHeight / 2,
        pfpWidth / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(targetPfp, x, y, pfpWidth, pfpHeight);
      ctx.restore();

      // ১০০% গোল লুক দেওয়ার জন্য কালো বর্ডার
      ctx.beginPath();
      ctx.arc(
        x + pfpWidth / 2,
        y + pfpHeight / 2,
        pfpWidth / 2,
        0,
        Math.PI * 2
      );
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      const caption = `╭──────•◈•───────╮\n 𝗜𝘀𝗹𝗮𝗺𝗶𝗰𝗸 𝗰𝗵𝗮𝘁 𝗯𝗼𝘁 \n\nহালা মুরগী চোর আজ তোকে হাতে নাতে ধরেছি_ 🐸👻\n\n BOT OWNER Ullash ッ\n🛠️ Modified by: 𝕸𝖎𝖑𝖔𝖓\n╰──────•◈•───────╯`;

      return api.sendMessage({
        body: caption,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

    } catch (e) {
      console.error("CHOR ERROR:", e);
      return api.sendMessage(`মামা চোরটা দেয়াল টপকে পালাইছে! আবার ট্রাই কর। ❌`, threadID, messageID);
    }
  }
};
