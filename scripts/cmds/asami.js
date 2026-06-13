const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const ORIGINAL_AUTHOR = "Farhan-Khan";

// 🔒 simple integrity check function
function verifyAuthor(configAuthor) {
  return configAuthor === ORIGINAL_AUTHOR;
}

module.exports = {
  config: {
    name: "asami",
    version: "1.0.0",
    author: ORIGINAL_AUTHOR, // 🔒 LOCKED
    countDown: 5,
    role: 0,
    category: "fun",
    description: "Wanted Criminal meme edit 🚨",
    guide: "{pn} @mention or reply"
  },

  onStart: async function ({ api, event, message }) {

    // 🔒 ANTI-EDIT CHECK
    if (!verifyAuthor(this.config.author)) {
      return message.reply("❌ This file has been modified illegally. Author mismatch detected!");
    }

    const { threadID, messageID, mentions, messageReply } = event;

    const cacheDir = path.join(process.cwd(), "cache");
    if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);

    let targetID = null;

    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply && messageReply.senderID) {
      targetID = messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("আরে ভাই, কোন আসামিরে ধরব তারে মেনশন বা রিপ্লাই দে! 🚨");
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "Criminal";

      // 🖼️ এখানে একটি Wanted Poster এর ডেমো লিংক দেওয়া হয়েছে
      // আপনি চাইলে Imgur এ অন্য ছবি আপলোড করে সেই লিংক এখানে বসাতে পারবেন
      const imgLink = "https://i.imgur.com/1Gv25a0.jpg"; 
      const filePath = path.join(cacheDir, `wanted_${Date.now()}.png`);

      message.reply("থানায় খবর দেওয়া হইছে, আসামির পোস্টার ছাপানো হইতেছে... ⏳🚨");

      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const targetPfpUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      const [baseImage, targetPfp] = await Promise.all([
        loadImage(imgLink),
        loadImage(targetPfpUrl)
      ]);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // প্রথমে ব্যাকগ্রাউন্ড (Wanted Poster) আঁকা
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // 📏 প্রোফাইল পিকচারের সাইজ এবং পজিশন
      const pfpSize = 180;
      const x = 160; // ডানে-বামে সরানোর জন্য (X axis)
      const y = 220; // উপরে-নিচে সরানোর জন্য (Y axis)

      ctx.save();
      // প্রোফাইল পিকচারটি গোল করার জন্য
      ctx.beginPath();
      ctx.arc(x + pfpSize / 2, y + pfpSize / 2, pfpSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(targetPfp, x, y, pfpSize, pfpSize);
      ctx.restore();

      // ছবির চারপাশে একটি লাল বর্ডার দেওয়া
      ctx.beginPath();
      ctx.arc(x + pfpSize / 2, y + pfpSize / 2, pfpSize / 2, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ff0000"; // লাল রং
      ctx.stroke();

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filePath, buffer);

      const finalCaption =
`🚨 ভয়ংকর ফেরারি আসামি! 🚨

নাম: ${userName}
অপরাধ: মানুষের মন চুরি করা এবং ইনবক্সে রিপ্লাই না দেওয়া! 🤣
ধরিয়ে দিলে আকর্ষণীয় পুরস্কার আছে! 🚓`;

      return api.sendMessage({
        body: finalCaption,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(filePath)
      }, threadID, () => {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }, messageID);

    } catch (e) {
      console.error("WANTED ERROR:", e);
      return message.reply("মামা আসামি তো জেল ভাইঙ্গা পালাইছে! আবার ট্রাই কর ❌");
    }
  }
};
