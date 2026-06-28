#cmd install pagol.js #cmd install pagol.js const axios = require("axios");
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
aliases: ["mad", "crazy", "mental", "pgl"],
version: "1.0.22",
author: "𝕸𝖎𝖑𝖔𝖓",
countDown: 5,
role: 0,
category: "fun",
usePrefix: true,
description: "Create a funny pagol image.",
guide: "{pn} @mention or reply"
},

onStart: async function ({ api, event, message }) {

// 🔒 ANTI-EDIT CHECK
if (!verifyAuthor(this.config.author)) {
return message.reply(❌ This file has been modified illegally. Author mismatch detected!\n\n👑 Original Creator: ${ORIGINAL_AUTHOR}`);
}

if (this.config.role > 0) {
const isAdmin = global.GoatBot.config.adminBot.includes(event.senderID);
if (!isAdmin) {
return message.reply("⚠️ আগে মিলন বসের থেকে অনুমতি নিয়ে এডমিন লেভেলে আয়, তারপর ট্রাই কর! 👑");
}
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

message.reply(🚑 রোগীকে পাবনায় পাঠানোর প্রস্তুতি চলছে... একটু ওয়েট করো! ⏳🤪);

const imgLink = "https://i.imgur.com/K0Bhwuc.jpeg";
const filePath = path.join(cacheDir, pagol_milon_${Date.now()}.png`);

const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
const targetPfpUrl = https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken};

const [baseImage, targetPfp] = await Promise.all([
loadImage(imgLink),
loadImage(targetPfpUrl)
 ]);

const canvas = createCanvas(baseImage.width, baseImage.height);
const ctx = canvas.getContext("2d");

ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

// ==========================================
// 📐 সুপার ফাইনাল ক্যালকুলেশন (X=419, Y=87)
// ==========================================
const pfpWidth = 144;
 const pfpHeight = 144;

const x = 410;
const y = 95;

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

ctx.beginPath();
ctx.arc(
x + pfpWidth / 2,
y + pfpHeight / 2,
pfpWidth / 2,
0,
Math.PI * 2
);
ctx.lineWidth = 4;
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
return message.reply("❌ API error call boss milon");
}
}
};


e
