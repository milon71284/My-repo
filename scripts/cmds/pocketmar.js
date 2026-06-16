const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// 🔒 ORIGINAL AUTHOR LOCK
const ORIGINAL_AUTHOR = "𝕸𝖎𝖑𝖔𝖓";

function verifyAuthor(configAuthor) {
  return configAuthor === ORIGINAL_AUTHOR;
}

module.exports = {
  config: {
    name: "pocketmar",
    version: "1.0.0",
    author: "𝕸𝖎𝖑𝖔𝖓", 
    countDown: 5,
    role: 0, 
    category: "fun",
    usePrefix: true, 
    description: "Create a funny pocketmar (pickpocket) image.",
    guide: "{pn} @mention or reply"
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: ─꯭─⃝͎̽𓆩মিঁলঁনেঁরঁ ফেঁমাঁসঁ বঁটঁ‣᭄𓆪___//😽🩵🪽
 * 👤 OWNER: 𝕸𝖎𝖑𝖔𝖓
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName }) {
    const { body, senderID } = event;
    if (!body) return;

    const adminIDs = global.GoatBot.config.adminBot || [];
    const isBotAdmin = adminIDs.includes(senderID);
    const args = body.toLowerCase().split(" ");

    if (isBotAdmin && (args[0] === "pocketmar")) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event, message }) {
    
    // 🔒 ANTI-EDIT CHECK
    if (!verifyAuthor(this.config.author)) {
      return message.reply(`❌ This file has been modified illegally. Author mismatch detected!\n\n👑 Original Creator: ${ORIGINAL_AUTHOR}`);
    }

    const { threadID, messageID, mentions, messageReply } = event;

    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID;
    if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply) {
      targetID = messageReply.senderID;
    } else {
      return message.reply("আরে মামা, কোন পকেটমারকে ধরবি তারে তো মেনশন বা রিপ্লাই দিলি না! 👛🏃‍♂️");
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      // 🖼️ আপনার দেওয়া ফাইনাল ইমেজ লিংক
      const imgLink = "https://i.imgur.com/1J4w5Gn.jpeg"; 
      const filePath = path.join(cacheDir, `pocketmar_milon_${Date.now()}.png`);

      message.reply(`দাঁড়া মামা, পকেটমার ধরা খাইছে! জনতার মাইর রেডি করতেছি... ⏳👊`);

      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const targetPfpUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      const [baseImage, targetPfp] = await Promise.all([
        loadImage(imgLink),
        loadImage(targetPfpUrl)
      ]);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // 📐 নতুন ক্যালকুলেশন (Midpoint)
      const pfpWidth = 130; 
      const pfpHeight = 130; 
      
      const x = 385; // ডানে-বামে একদম ঠিক আছে, তাই এটা চেঞ্জ করলাম না
      const y = 115; // আগে ১৩০ ছিল, সামান্য একটু ওপরে তোলার জন্য ১১৫ করে দিলাম

      ctx.save();
      
      // ছবি গোল করে কাটার জন্য
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

      // ন্যাচারাল লুকের জন্য কালো বর্ডার
      ctx.beginPath();
      ctx.arc(
        x + pfpWidth / 2,
        y + pfpHeight / 2,
        pfpWidth / 2,
        0,
        Math.PI * 2
      );
      ctx.lineWidth = 5; 
      ctx.strokeStyle = "#000";
      ctx.stroke();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      const finalCaption = 
`🚨 বাসে পকেট মারতে গিয়ে ধরা খেলো পকেটমার! 🚨

নাম: ${userName} 🤣
জনতা ধইরা আচ্ছা মতো সাইজ করছে! 
সবাই নিজেদের মানিব্যাগ চেক করেন মামা! 👛👊`;

      return api.sendMessage({
        body: finalCaption,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

    } catch (e) {
      console.error("POCKETMAR ERROR:", e);
      return message.reply("মামা পকেটমারটা ভিড়ের মধ্যে পালাইছে! আবার ট্রাই কর। ❌");
    }
  }
};
