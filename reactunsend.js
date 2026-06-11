module.exports = {
  config: {
    name: "reactUnsend",
    version: "1.2.0",
    author: "𝐌𝐢𝐥𝐨𝐧", // স্টাইলিশ এবং বোল্ড নাম
    countDown: 5,
    role: 2,
    shortDescription: "রিয়্যাক্ট দিয়ে মেসেজ ডিলিট",
    longDescription: "মেসেজে নির্দিষ্ট কয়েকটি রিয়্যাক্ট দিলে সেটি আনসেন্ট হয়ে যাবে (পাবলিক/প্রাইভেট মোড)।",
    category: "moderation",
  },

  // কনফিগারেশন অপশন (এখানে ৩-৪ টা ইমোজি দেওয়া হলো)
  settings: {
    targetReacts: ["😡", "😢", "👎", "❌"], // যে রিয়্যাক্টগুলো দিলে মেসেজ ডিলিট হবে
    isAdminOnly: true   // true মানে প্রাইভেট (শুধু এডমিন পারবে), false মানে পাবলিক (সবাই পারবে)
  },

  onReaction: async function({ event, api, threadsData }) {
    const { settings, config } = this;
    const { reaction, messageID, userID, threadID } = event;

    // Author Lock Check (কেউ নাম চেঞ্জ করলে কাজ করবে না)
    if (config.author !== "𝐌𝐢𝐥𝐨𝐧") {
      return api.sendMessage("⚠️ এই কমান্ডের Author Name পরিবর্তন করা হয়েছে! দয়া করে অরিজিনাল অথর '𝐌𝐢𝐥𝐨𝐧' ব্যবহার করুন।", threadID);
    }

    // ১. চেক করা হচ্ছে রিয়্যাক্টটি আমাদের লিস্টে আছে কি না
    if (!settings.targetReacts.includes(reaction)) return;

    // ২. মোড চেক করা হচ্ছে (প্রাইভেট নাকি পাবলিক)
    if (settings.isAdminOnly) {
      // বটের গ্লোবাল কনফিগারেশন থেকে এডমিন লিস্ট
      const globalAdmins = global.GoatBot.config.adminBot || [];
      
      // গ্রুপের লোকাল এডমিন লিস্ট
      const threadInfo = await threadsData.get(threadID);
      const threadAdmins = threadInfo.adminIDs || [];

      // রিয়্যাক্ট দেওয়া ব্যক্তিটি বটের বা গ্রুপের এডমিন কি না
      const isBotAdmin = globalAdmins.includes(userID);
      const isThreadAdmin = threadAdmins.some(admin => admin.id === userID);

      // যদি সে এডমিন না হয়, তবে মেসেজ ডিলিট হবে না
      if (!isBotAdmin && !isThreadAdmin) return;
    }

    // ৩. শর্ত মিললে মেসেজটি আনসেন্ট করে দেওয়া হবে
    try {
      await api.unsendMessage(messageID);
    } catch (err) {
      console.error("রিয়্যাক্টের মাধ্যমে আনসেন্ট করতে ব্যর্থ:", err);
    }
  },

  onStart: async function({ message }) {
    // Author Lock Check for onStart
    if (this.config.author !== "𝐌𝐢𝐥𝐨𝐧") {
      return message.reply("⚠️ কমান্ডের কোড এডিট করে Author Name চেঞ্জ করা হয়েছে! \n\n— অরিজিনাল কোডার: 𝐌𝐢𝐥𝐨𝐧");
    }

    message.reply("✅ React Unsend সিস্টেম সচল আছে।\n\n📌 ইমোজি লিস্ট: 😡, 😢, 👎, ❌\n\n— 𝐀𝐮𝐭𝐡𝐨𝐫: 𝐌𝐢𝐥𝐨𝐧");
  }
};
