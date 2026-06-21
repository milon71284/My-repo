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
    name: "arrest",
    aliases: ["arrestpic", "police"],
    version: "1.0.3",
    author: "𝕸𝖎𝖑𝖔𝖓", 
    countDown: 5,
    role: 0, 
    category: "fun",
    usePrefix: true, 
    description: "Arrest a criminal in the police station!",
    guide: "{pn} @mention or reply"
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: ─꯭─⃝͎̽𓆩মিঁলঁনেঁরঁ ফেঁমাঁসঁ বঁটঁ‣᭄𓆪___//😽🩵🪽
 * 👤 OWNER: 𝕸𝖎𝖑𝖔𝖓
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName }) {
    const { body } = event;
    if (!body) return;

    const args = body.toLowerCase().split(" ");
    const prefix = global.GoatBot.config.prefix;

    if (args[0] === "arrest" || args[0] === "arrestpic" || args[0] === `${prefix}arrest` || args[0] === `${prefix}arrestpic`) {
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
      targetID = event.senderID; 
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      message.reply(`🚨 পুলিশ এসে গেছে! হাতকড়া পরানো হচ্ছে... ⏳🚓`);

      // 🖼️ আপনার দেওয়া ইমগুর লিংক (সরাসরি থানায় গ্রেফতারের রিয়ালিস্টিক ছবি)
      const imgLink = "https://i.imgur.com/2O67qUU.jpeg"; 
      const filePath = path.join(cacheDir, `arrest_milon_${Date.now()}.png`);

      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const targetPfpUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      const [baseImage, targetPfp] = await Promise.all([
        loadImage(imgLink),
        loadImage(targetPfpUrl)
      ]);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // ব্যাকগ্রাউন্ড ড্র করা
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // 📐 নতুন জেনারেট করা ছবির মুখ অনুযায়ী একদম নিখুঁত মাপ
      const pfpWidth = 140; 
      const pfpHeight = 140; 
      
      // ডানে-বামে অপরাধীর ফেসের পজিশন
      const x = 570; 
      // ওপরে-নিচে অপরাধীর ফেসের পজিশন
      const y = 150; 

      ctx.save();
      
      // প্রোফাইল পিক গোল করে কাটা
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

      // ন্যাচারাল লুক ও ফিনিশিংয়ের জন্য কালো বর্ডার
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
`🚨 মাইনকা চিপায় ধরা খাইলো আসামি! 🚨

নাম: ${userName} 🤣
ডিএমপি পুলিশ হাতেনাতে ধরে থানায় নিয়ে এসেছে! কেউ আর সুপারিশ করতে আইসেন না! 🚓⛓️`;

      return api.sendMessage({
        body: finalCaption,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

    } catch (e) {
      console.error("ARREST ERROR:", e);
      return message.reply("মামা আসামি পুলিশের চোখ ফাঁকি দিয়ে পালাইছে! আবার ট্রাই কর। ❌");
    }
  }
};
