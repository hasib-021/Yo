const axios = require("axios");
const fs = require("fs-extra");
const request = require("request");

// ✅ Allowed owners
const OWNER_IDS = [
  "61587417024496",
  "61557991443492"
];

module.exports = {
  config: {
    name: "join",
    version: "2.2",
    author: "Hasib",
    countDown: 5,
    role: 0,
    shortDescription: "Owner only join group command",
    longDescription: "Shows all group chats and lets ONLY OWNERS join one by replying with its number.",
    category: "owner",
    guide: {
      en: "{p}{n}"
    },
  },

  onStart: async function ({ api, event }) {
    try {
      // 🔐 Owner check
      if (!OWNER_IDS.includes(event.senderID)) {
        return api.sendMessage(
          "This join Command does not exist, type !help to see all available commands",
          event.threadID,
          event.messageID
        );
      }

      const groupList = await api.getThreadList(100, null, ['INBOX']);
      const filteredList = groupList.filter(
        group => group.isGroup && group.threadName
      );

      if (filteredList.length === 0) {
        return api.sendMessage("No group chats found.", event.threadID);
      }

      const formattedList = filteredList.map((group, index) =>
        `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
      );

      const message =
`╭─╮
│ 𝐋𝐢𝐬𝐭 𝐨𝐟 𝐆𝐫𝐨𝐮𝐩𝐬:
${formattedList.join("\n")}
╰───────────ꔪ
Reply with the group number you want to join.`;

      const sentMessage = await api.sendMessage(message, event.threadID);

      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: "join",
        messageID: sentMessage.messageID,
        author: event.senderID
      });

    } catch (err) {
      console.error(err);
      api.sendMessage("⚠️ Error while listing groups.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, args }) {
    try {
      // 🔐 Owner check again (important)
      if (!OWNER_IDS.includes(event.senderID)) {
        return api.sendMessage(
          "⛔ You are not allowed to use this command.",
          event.threadID,
          event.messageID
        );
      }

      if (event.senderID !== Reply.author) return;

      const groupIndex = parseInt(args[0]);
      if (isNaN(groupIndex) || groupIndex <= 0) {
        return api.sendMessage(
          "⚠️ Please reply with a valid number.",
          event.threadID,
          event.messageID
        );
      }

      const groupList = await api.getThreadList(100, null, ['INBOX']);
      const filteredList = groupList.filter(
        group => group.isGroup && group.threadName
      );

      if (groupIndex > filteredList.length) {
        return api.sendMessage(
          "⚠️ Invalid group number.",
          event.threadID,
          event.messageID
        );
      }

      const selectedGroup = filteredList[groupIndex - 1];
      const groupID = selectedGroup.threadID;
      const info = await api.getThreadInfo(groupID);

      if (info.participantIDs.includes(event.senderID)) {
        return api.sendMessage(
          `✅ You are already in "${selectedGroup.threadName}"`,
          event.threadID,
          event.messageID
        );
      }

      if (info.participantIDs.length >= 250) {
        return api.sendMessage(
          `❌ "${selectedGroup.threadName}" is full.`,
          event.threadID,
          event.messageID
        );
      }

      await api.addUserToGroup(event.senderID, groupID);
      api.sendMessage(
        `🎉 Successfully joined "${selectedGroup.threadName}"`,
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        "⚠️ Error while joining the group.",
        event.threadID,
        event.messageID
      );
    } finally {
      global.GoatBot.onReply.delete(event.messageID);
    }
  }
};
