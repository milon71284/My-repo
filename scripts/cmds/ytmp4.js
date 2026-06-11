const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ytmp4",
    version: "4.7.0",
    author: "mahbub | fixed by Milon Pro",
    countDown: 5,
    role: 0,
    shortDescription: "YouTube downloader (No Prefix)",
    longDescription: "Search and download YouTube videos with force-delete list",
    category: "media",
    guide: "ytmp4 <song name>",
    usePrefix: false 
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN
 * 🔗 FACEBOOK: https://www.facebook.com/share/17uGq8qVZ9/
 * 📞 WHATSAPP: +880 1912603270
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, args }) {
    if (event.body && event.body.toLowerCase().startsWith("ytmp4")) {
      const input = event.body.split(/\s+/).slice(1).join(" ");
      if (!input) {
        return api.sendMessage("❌ | মামা, ভিডিওর নাম তো দিলা না!", event.threadID, event.messageID);
      }
      return this.onStart({ api, event, message, args: event.body.split(/\s+/).slice(1) });
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    
    if (!query) return;

    try {
      api.setMessageReaction("🔍", messageID, (err) => {}, true);
      const search = await yts(query);
      const videos = search.videos.slice(0, 10);

      if (videos.length === 0) return api.sendMessage("❌ | মামা, ইউটিউবে কিছু পাওয়া যায় নাই!", threadID);

      let msg = "✨🔍 𝙔𝙤𝙪𝙏𝙪𝙗𝙚 𝙎𝙚𝙖𝙧𝙘𝙝 𝙍𝙚𝙨𝙪𝙡𝙩𝙨 ✨\n\n";
      videos.forEach((v, i) => {
        msg += `🟢 ${i + 1}. ${v.title}\n⏱ 𝐃𝐮𝐫𝐚𝐭𝐢𝐨𝐧: ${v.timestamp}\n💻 𝐏𝐥𝐚𝐭𝐟𝐨𝐫𝐦: ${v.author.name}\n\n`;
      });
      msg += "➡ Reply with number (1-10)";

      const sent = await api.sendMessage(msg, threadID);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "ytmp4",
        author: event.senderID,
        messageID: sent.messageID,
        videos
      });
    } catch (err) {
      api.sendMessage("❌ | সার্চ করতে সমস্যা হচ্ছে মামা!", threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== Reply.author) return;

    const choice = parseInt(body);
    if (isNaN(choice) || choice < 1 || choice > 10)
      return api.sendMessage("❌ মামা, ১ থেকে ১০ এর মধ্যে নাম্বার দে!", threadID);

    const video = Reply.videos[choice - 1];

    try {
      // ১. লিস্ট ডিলিট করার সর্বোচ্চ চেষ্টা (Force Unsend)
      await api.unsendMessage(Reply.messageID).catch(err => console.log("List Delete Failed: ", err));
      
      const loading = await api.sendMessage("⏳ Downloading video...", threadID);

      const infoRes = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp4?url=${encodeURIComponent(video.url)}`);
      const info = infoRes.data;
      const format360 = info.formats.find(f => f.quality === "360p") || info.formats[0];

      // ইনফো মেসেজ
      await api.editMessage(
        `⬇ Download Started\n\n🎥 ${info.title}\n📺 Channel: ${info.uploader}\n📥 Quality: ${format360.quality}`,
        loading.messageID
      );

      const dlRes = await axios.get(`https://mahabub-apis.fun/mahabub/ytmp4?url=${encodeURIComponent(video.url)}&format=${format360.format_id}`);
      const videoUrl = dlRes.data.download.url;

      const cacheDir = path.join(process.cwd(), "cache");
      if (!fs.existsSync(cacheDir)) fs.ensureDirSync(cacheDir);
      const filePath = path.join(cacheDir, `yt_${Date.now()}.mp4`);

      const writer = fs.createWriteStream(filePath);
      const response = await axios({ url: videoUrl, method: "GET", responseType: "stream" });

      response.data.pipe(writer);

      writer.on("finish", async () => {
        // ২. ভিডিও পাঠানোর আগে ডাউনলোড স্টার্টেড মেসেজ ডিলিট
        await api.unsendMessage(loading.messageID).catch(err => console.log("Info Delete Failed: ", err));

        await api.sendMessage({
          body: `✅ এই নে মামা তোর ভিডিও!\n\n🎥 ${info.title}`,
          attachment: fs.createReadStream(filePath)
        }, threadID, messageID); // তোমার মেসেজে রিপ্লাই

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("❌ ডাউনলোড ফেইল হইছে মামা!", threadID);
    }
  }
};
