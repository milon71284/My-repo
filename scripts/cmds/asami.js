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

      // 🖼️ আপনার দেওয়া নতুন লিংক
      const imgLink = "https://i.imgur.com/eD4nkVu.jpeg"; 
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

      // ব্যাকগ্রাউন্ড আঁকা
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // 📏 প্রোফাইল পিকচারের নতুন সাইজ এবং পজিশন
      const pfpSize = 420; // ছবির ফ্রেম অনুযায়ী সাইজ বড় করা হয়েছে
      
      // X-axis: ছবিটাকে অটোমেটিক মাঝখানে বসানোর জন্য
      const x = (canvas.width - pfpSize) / 2; 
      
      // Y-axis: ওপর থেকে কতটা নিচে নামবে
      const y = 300; 

      ctx.save();
      
      // প্রোফাইল পিকচারটি গোল করার জন্য
      ctx.beginPath();
      ctx.arc(x + pfpSize / 2, y + pfpSize / 2, pfpSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(targetPfp, x, y, pfpSize, pfpSize);
      ctx.restore();

      // ছবির চারপাশে একটি ভিনটেজ স্টাইলের গাঢ় খয়েরি বর্ডার দেওয়া
      ctx.beginPath();
      ctx.arc(x + pfpSize / 2, y + pfpSize / 2, pfpSize / 2, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#3e2723"; // গাঢ় খয়েরি রং
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
