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
    name: "pagol",
    version: "1.0.0",
    author: "𝕸𝖎𝖑𝖔𝖓", 
    countDown: 5,
    role: 0, 
    category: "fun",
    usePrefix: true, 
    description: "Create a funny pagol image.",
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

    const args = body.toLowerCase().split(" ");
    const prefix = global.GoatBot.config.prefix;

    // pgl বা pagol যেটাই লিখুক, কাজ করবে (onChat লজিক)
    if (args[0] === "pagol" || args[0] === "pgl" || args[0] === `${prefix}pagol` || args[0] === `${prefix}pgl`) {
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
      // কাউকে মেনশন না করলে নিজের ছবি বসবে
      targetID = event.senderID; 
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      // 🖼️ পাগলের ইমেজ লিংক
      const imgLink = "https://i.imgur.com/AJktgYq.jpeg"; 
      const filePath = path.join(cacheDir, `pagol_milon_${Date.now()}.png`);

      message.reply(`দাঁড়া মামা, মাথার তার জোড়া লাগাইতেছি... ⏳🤪`);

      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const targetPfpUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      const [baseImage, targetPfp] = await Promise.all([
        loadImage(imgLink),
        loadImage(targetPfpUrl)
      ]);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // 📐 পারফেক্ট ক্যালকুলেশন
      const pfpWidth = 190; 
      const pfpHeight = 190; 
      
      const x = (canvas.width / 2) - (pfpWidth / 2); 
      
      // আগে -100 ছিল, একটু নিচে নামানোর জন্য -75 করে দিলাম
      const y = (canvas.height / 2) - (pfpHeight / 2) - 75; 

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
      ctx.lineWidth = 6; 
      ctx.strokeStyle = "#000";
      ctx.stroke();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      const finalCaption = 
`🚨 রাস্তায় নতুন পাগল পাওয়া গেছে! 🚨

নাম: ${userName} 🤣
মাথার তার সব ছিঁড়া গেছে! সবাই একটু সাবধানে থাকবেন! 🤪`;

      return api.sendMessage({
        body: finalCaption,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

    } catch (e) {
      console.error("PAGOL ERROR:", e);
      return message.reply("মামা পাগলটা দৌড় দিছে! আবার ট্রাই কর। ❌");
    }
  }
};
