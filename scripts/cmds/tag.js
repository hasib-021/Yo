module.exports = {
  config: {
    name: "tag",
    category: "GROUP",
    role: 0,
    author: "Hasib",
    countDown: 3,
    description: {
      en: "Tag by reply, name or tag all members"
    },
    guide: {
      en: "{pm}tag [name] [msg]\n{pm}tag all [msg]\nReply + {pm}tag [msg]"
    }
  },

  onStart: async ({ api, event, usersData, threadsData, args }) => {
    const { threadID, messageID, messageReply } = event;

    try {
      const threadData = await threadsData.get(threadID);
      if (!threadData || !threadData.members) {
        return api.sendMessage("❌ Cannot read group members", threadID, messageID);
      }

      const members = threadData.members
        .filter(m => m.inGroup)
        .map(m => ({
          name: m.name,
          id: m.userID
        }));

      if (members.length === 0) {
        return api.sendMessage("❌ No members found", threadID, messageID);
      }

      let tagUsers = [];
      let text = "";

      // ✅ Reply tag
      if (messageReply) {
        const uid = messageReply.senderID;
        const name = await usersData.getName(uid);
        tagUsers.push({ name, id: uid });
        text = args.join(" ");
      }

      // ✅ Tag all
      else if (args[0] && ["all", "cdi"].includes(args[0].toLowerCase())) {
        tagUsers = members;
        text = args.slice(1).join(" ");
      }

      // ✅ Tag by name
      else {
        if (!args[0]) {
          return api.sendMessage(
            "⚠️ Use reply / name / tag all",
            threadID,
            messageID
          );
        }

        const searchName = args[0].toLowerCase();
        text = args.slice(1).join(" ");

        tagUsers = members.filter(m =>
          m.name.toLowerCase().includes(searchName)
        );

        if (tagUsers.length === 0) {
          return api.sendMessage("❌ User not found", threadID, messageID);
        }
      }

      const mentions = tagUsers.map(u => ({
        tag: u.name,
        id: u.id
      }));

      // 🔥 BODY (your requested line)
      const body = text
        ? `oi aktu shuno😒\n${text}`
        : "oi aktu shuno😒";

      api.sendMessage(
        { body, mentions },
        threadID,
        messageReply ? messageReply.messageID : messageID
      );

    } catch (err) {
      api.sendMessage("❌ Error: " + err.message, threadID, messageID);
    }
  }
};
