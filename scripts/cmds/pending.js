module.exports = {
  config: {
    name: "pending",
    aliases: ["pen"],
    version: "2.0",
    author: "Hasib",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Manage pending group approvals"
    },
    longDescription: {
      en: "Only bot config admins can approve or reject pending groups"
    },
    category: "Admin",
    guide: {
      en: {
        body:
          "{pn} → View pending groups\n" +
          "Reply with number(s) to approve\n" +
          "Reply with c + number(s) to reject"
      }
    }
  },

  langs: {
    en: {
      noPermission: "🚫 Only bot admins can use this command!",
      invalidNumber: "❌ %1 is not a valid number",
      approved: "✅ Approved %1 group(s)!",
      rejected: "❌ Rejected %1 group(s)!",
      noPending: "📭 No pending groups found.",
      error: "❌ Failed to get pending list."
    }
  },

  // ================= REPLY HANDLER =================
  onReply: async function ({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;

    const { body, threadID, messageID } = event;
    let count = 0;

    // ❌ REJECT
    if (body.toLowerCase().startsWith("c")) {
      const nums = body.slice(1).trim().split(/\s+/);

      for (const n of nums) {
        if (isNaN(n) || n < 1 || n > Reply.pending.length)
          return api.sendMessage(
            getLang("invalidNumber", n),
            threadID,
            messageID
          );

        try {
          api.removeUserFromGroup(
            api.getCurrentUserID(),
            Reply.pending[n - 1].threadID
          );
          count++;
        } catch {}
      }

      return api.sendMessage(
        getLang("rejected", count),
        threadID,
        messageID
      );
    }

    // ✅ APPROVE
    const nums = body.trim().split(/\s+/);

    for (const n of nums) {
      if (isNaN(n) || n < 1 || n > Reply.pending.length)
        return api.sendMessage(
          getLang("invalidNumber", n),
          threadID,
          messageID
        );

      try {
        const tid = Reply.pending[n - 1].threadID;

        // ONLY SEND NOTIFICATION
        api.sendMessage(
          "✅ Bot is now active in this group",
          tid
        );

        count++;
      } catch {}
    }

    return api.sendMessage(
      getLang("approved", count),
      threadID,
      messageID
    );
  },

  // ================= MAIN COMMAND =================
  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID, senderID } = event;

    // 🔐 BOT CONFIG ADMINS ONLY
    if (!global.GoatBot.config.adminBot.includes(String(senderID))) {
      return api.sendMessage(
        getLang("noPermission"),
        threadID,
        messageID
      );
    }

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]);
      const pending = await api.getThreadList(100, null, ["PENDING"]);
      const list = [...spam, ...pending].filter(t => t.isGroup);

      if (!list.length)
        return api.sendMessage(
          getLang("noPending"),
          threadID,
          messageID
        );

      let msg = "";
      list.forEach((g, i) => {
        msg += `${i + 1}. ${g.name || "Unnamed Group"}\nID: ${g.threadID}\n\n`;
      });

      api.sendMessage(
        `📋 PENDING GROUPS (${list.length})\n\n${msg}\nReply with number(s) to approve\nReply with c + number(s) to reject`,
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              author: senderID,
              pending: list
            });
          }
        },
        messageID
      );
    } catch {
      return api.sendMessage(
        getLang("error"),
        threadID,
        messageID
      );
    }
  }
};
