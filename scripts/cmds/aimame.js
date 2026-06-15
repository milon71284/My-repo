const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// 🔒 ORIGINAL AUTHOR LOCK
const ORIGINAL_AUTHOR = "𝕸𝖎𝖑𝖔𝖓";

function verifyAuthor(configAuthor) {
  return configAuthor === ORIGINAL_AUTHOR;
}

// 🔑 Google Gemini API Configuration (The environment will provide the key at runtime)
const apiKey = "";

// Exponential Backoff Retry Helper for API Calls
async function postWithRetry(url, data, retries = 5, delay = 1000) {
  try {
    const response = await axios.post(url, data, { timeout: 60000 });
    return response.data;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return postWithRetry(url, data, retries - 1, delay * 2);
    }
    throw error;
  }
}

module.exports = {
  config: {
    name: "aimeme",
    aliases: ["aipic", "aimem"],
    version: "2.0.0",
    author: "𝕸𝖎𝖑𝖔𝖓", 
    countDown: 10,
    role: 2, 
    category: "fun",
    usePrefix: true, 
    description: "Generate dynamic memes using Gemini & Imagen AI!",
    guide: "{pn} [scenario/prompt] @mention"
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: ─꯭─⃝͎̽𓆩মিঁলঁনেঁরঁ ফেঁমাঁসঁ বঁটঁ‣᭄𓆪___//😽🩵🪽
 * 👤 OWNER: 𝕸𝖎𝖑ону
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName }) {
    const { body, senderID } = event;
    if (!body) return;

    const args = body.toLowerCase().split(" ");
    const prefix = global.GoatBot.config.prefix;

    if (args[0] === "aimeme" || args[0] === "aipic" || args[0] === `${prefix}aimeme` || args[0] === `${prefix}aipic`) {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event, message }) {
    
    // 🔒 ANTI-EDIT CHECK
    if (!verifyAuthor(this.config.author)) {
      return message.reply(`❌ This file has been modified illegally. Author mismatch detected!\n\n👑 Original Creator: ${ORIGINAL_AUTHOR}`);
    }

    const { threadID, messageID, mentions, messageReply, body } = event;

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

    // এক্সট্রাক্ট প্রম্পট (মেনশন রিমুভ করে)
    let userPrompt = body.replace(/^[^\s]+/, "").trim();
    if (Object.keys(mentions).length > 0) {
      for (const id in mentions) {
        userPrompt = userPrompt.replace(mentions[id], "").trim();
      }
    }

    // যদি কোনো প্রম্পট না দেয়, ডিফল্ট ফানি প্রম্পট
    if (!userPrompt) {
      userPrompt = "রাস্তায় বসে ভিক্ষা করছে আর গান গাচ্ছে";
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "User";

      message.reply(`🧠 জেমিনি এআই আপনার মিম স্ক্রিপ্ট তৈরি করছে... ⏳`);

      // ১. জেমিনি টেক্সট এপিআই দিয়ে প্রম্পট রিফাইনমেন্ট করা
      const textModelUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const systemPrompt = "You are a professional image prompt engineer. Convert the user's funny description (often in Bengali or English) into a highly detailed English prompt for an image generator. CRITICAL INSTRUCTION: The prompt must specify that in the exact center of the image, there is a large, clean, perfectly circular black or empty frame/avatar placeholder on the face of the main character so we can place a photo there later. The style should be funny, detailed, realistic, cinematic lighting, 8k resolution.";
      
      const textPayload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      const textResult = await postWithRetry(textModelUrl, textPayload);
      const optimizedPrompt = textResult.candidates?.[0]?.content?.parts?.[0]?.text || `A funny realistic image of a person ${userPrompt}. The main character has a large clean black empty circular space on their face for an avatar placeholder, centered, cinematic lighting, 8k resolution.`;

      message.reply(`🎨 Imagen 4.0 এপিআই দিয়ে মিম পিকচার জেনারেট হচ্ছে... ⏳`);

      // ২. Imagen 4.0 এপিআই দিয়ে ইউনিক ব্যাকগ্রাউন্ড জেনারেট করা
      const imageModelUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      const imagePayload = {
        instances: { prompt: optimizedPrompt },
        parameters: { sampleCount: 1 }
      };

      const imageResult = await postWithRetry(imageModelUrl, imagePayload);
      const base64ImageBytes = imageResult.predictions?.[0]?.bytesBase64Encoded;

      if (!base64ImageBytes) {
        throw new Error("Failed to generate image bytes from Imagen API.");
      }

      // ক্যানভাসে ইম্পোর্ট করার জন্য ইমেজ বাফারে রূপান্তর
      const baseImageBuffer = Buffer.from(base64ImageBytes, "base64");
      const tempBaseFilePath = path.join(cacheDir, `temp_base_${Date.now()}.png`);
      fs.writeFileSync(tempBaseFilePath, baseImageBuffer);

      // ৩. ফেস মার্জিং (ক্যানভাস)
      const accessToken = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
      const targetPfpUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=${accessToken}`;

      const [baseImage, targetPfp] = await Promise.all([
        loadImage(tempBaseFilePath),
        loadImage(targetPfpUrl)
      ]);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // বেস এআই ইমেজ আঁকা
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // মাঝখানে প্রোফাইল পিকচার প্লেসমেন্ট (১৩২ পিক্সেল ডায়ামিটার)
      const pfpWidth = Math.min(canvas.width, canvas.height) * 0.22; // ডাইনামিক রেশিও অনুযায়ী ফেস সাইজ
      const pfpHeight = pfpWidth;
      const x = (canvas.width / 2) - (pfpWidth / 2);
      const y = (canvas.height / 2) - (pfpHeight / 2) - (canvas.height * 0.02); // সামান্য একটু ওপরে সেন্টার করা

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

      // স্টাইলিশ গোল্ডেন/ব্ল্যাক বর্ডার
      ctx.beginPath();
      ctx.arc(
        x + pfpWidth / 2,
        y + pfpHeight / 2,
        pfpWidth / 2,
        0,
        Math.PI * 2
      );
      ctx.lineWidth = Math.max(3, pfpWidth * 0.04);
      ctx.strokeStyle = "#000000";
      ctx.stroke();

      const finalFilePath = path.join(cacheDir, `aimeme_final_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(finalFilePath, buffer);

      // টেম্পোরারি ফাইল রিমুভ
      if (fs.existsSync(tempBaseFilePath)) fs.unlinkSync(tempBaseFilePath);

      const finalCaption = `✨ 𝕸𝖎𝖑𝖔𝖓 𝕬𝕴 𝕸𝖊𝖒𝖊 𝕬𝕻𝕴 ✨\n\n🎯 সিনারিও: "${userPrompt}"\n👤 ভিকটিম: ${userName}\n\n😂 জেমিনি এবং ইমাজিন এপিআই দিয়ে রিয়েল-টাইমে তৈরি করা!`;

      return api.sendMessage({
        body: finalCaption,
        mentions: [{ tag: userName, id: targetID }],
        attachment: fs.createReadStream(finalFilePath)
      }, threadID, () => {
        if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);
      }, messageID);

    } catch (e) {
      console.error("AI MEME ERROR:", e);
      return message.reply("মামা এআই মিম জেনারেটর এপিআই সাময়িকভাবে বিজি আছে! আবার ট্রাই কর। ❌");
    }
  }
};
