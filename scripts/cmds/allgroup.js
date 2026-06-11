module.exports = {
  config: {
    name: "allgroup",
    aliases: ["allgc"],
    version: "1.9.0",
    role: 2, // Only Bot Admin
    author: "Milon",
    description: "View and manage active groups without any prefix.",
    category: "admin",
    usePrefix: false, 
    countDown: 2
  },

/* --- [ 🔐 FILE_CREATOR_INFORMATION ] ---
 * 🤖 BOT NAME: MILON BOT
 * 👤 OWNER: MILON HASAN
 * 🔗 FACEBOOK: https://www.facebook.com/share/17uGq8qVZ9/
 * 📞 WHATSAPP: +880 1912603270
 * 📍 LOCATION: NARAYANGANJ, BANGLADESH
 * 🛠️ PROJECT: MILON BOT PROJECT (2026)
 * --------------------------------------- */

  onChat: async function ({ api, event, message, commandName }) {
    // মামা, এই অংশটি প্রিফিক্স ছাড়া কমান্ড চেক করবে
    const { body } = event;
    if (!body) return;
    const args = body.toLowerCase().split(" ");
    if (args[0] === "allgroup" || args[0] === "allgc") {
        return this.onStart({ api, event, message, commandName });
    }
  },

  onStart: async function ({ api, event, message, commandName }) {
    try {
      const botID = api.getCurrentUserID();
      
      // Fast fetching from Inbox
      const threadList = await api.getThreadList(100, null, ["INBOX"]);
      
      if (!threadList || threadList.length === 0) {
        return message.reply("Error: Facebook denied the request. Please try again later.");
      }

      // Filter active groups only
      const activeGroups = threadList.filter(group => 
        group.isGroup && 
        group.isSubscribed && 
        group.participantIDs && 
        group.participantIDs.includes(botID)
      );

      const totalActive = activeGroups.length;

      if (totalActive === 0) {
        return message.reply("No active groups found.");
      }

      let msg = `📊 [ MILON BOT - ACTIVE GROUPS: ${totalActive} ]\n\n`;
      let groupIDs = [];

      activeGroups.forEach((group, index) => {
        const name = group.name || "Unnamed Group";
        const members = group.participantIDs ? group.participantIDs.length : "0";
        msg += `${index + 1}. ${name}\n🆔 ID: ${group.threadID}\n👥 Members: ${members}\n\n`;
        groupIDs.push(group.threadID);
      });

      msg += `🎮 Actions:\n1. Reply "out <num>" to leave.\n2. Reply "add <num>" to join.\n3. Reply "ban <num>" to block.`;

      return message.reply(msg, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          groupIDs
        });
      });

    } catch (error) {
      console.error("AllGroup Error:", error);
      return message.reply("Critical Error: API restrictions detected.");
    }
  },

  onReply: async function ({ api, event, Reply, message, threadsData }) {
    const { author, groupIDs } = Reply;
    if (event.senderID != author) return;

    const input = event.body.split(" ");
    const action = input[0].toLowerCase();
    const index = parseInt(input[1]) - 1;
    const targetID = groupIDs[index];

    if (!targetID || isNaN(index)) return message.reply("Invalid choice! Use: <action> <number>");

    if (action === "out") {
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), targetID);
        return message.reply(`✅ Success: Bot left Group ID: ${targetID}`);
      } catch (e) {
        return message.reply("❌ Error: Unable to leave.");
      }
    }

    if (action === "add") {
      try {
        await api.addUserToGroup(author, targetID);
        return message.reply(`✅ Success: Added you to Group ID: ${targetID}`);
      } catch (e) {
        return message.reply("❌ Error: Bot needs admin permission.");
      }
    }

    if (action === "ban") {
      try {
        const data = await threadsData.get(targetID);
        if (!data.data) data.data = {};
        data.data.banned = true;
        await threadsData.set(targetID, data.data, "data");
        
        await api.sendMessage("🚫 Banned by Admin.", targetID);
        await api.removeUserFromGroup(api.getCurrentUserID(), targetID);
        return message.reply(`✅ Success: Group ${targetID} banned.`);
      } catch (e) {
        return message.reply("❌ Error: DB update failed.");
      }
    }
  }
};
