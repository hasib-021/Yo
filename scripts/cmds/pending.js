module.exports = {
  config: {
    name: "pending",
    aliases: ["pen"],
    version: "1.3",
    author: "Hasib (fixed)",
    countDown: 5,
    role: 2,
    shortDescription: { en: "Manage pending group approvals" },
    longDescription: { en: "View, approve or reject groups waiting to add the bot" },
    category: "Admin",
    guide: {
      en: {
        body:
          "{pn} → View pending groups\n" +
          "Reply numbers → Approve\n" +
          "Reply c<number> → Reject\n" +
          "Example: 1 2 | c1 c2"
      }
    }
  },

  langs: {
    en: {
      invalidNumber: "❌ %1 is not a valid number",
      cancelSuccess: "❌ Rejected %1 group(s)!",
      approveSuccess: "✅ Approved %1 group(s)!",
      cantGetPendingList: "❌ Can't get pending list!",
      returnListPending:
        "📋 「PENDING GROUPS」\n" +
        "Total: %1\n" +
        "Reply numbers to approve\n" +
        "Use c<number> to reject\n\n%2",
      returnListClean: "📭 No pending groups found"
    }
  },

  // ================== ON REPLY ==================
  onReply: async ({ api, event, Reply, getLang }) => {
    if (event.senderID !== Reply.author) return;

    const body = event.body.trim().toLowerCase();
    let count = 0;

    // ❌ REJECT
    if (body.startsWith("c")) {
      const nums = body.replace(/^c/, "").split(/\s+/);

      for (const n of nums) {
        const index = parseInt(n);
        if (!index || index < 1 || index > Reply.pending.length)
          return api.sendMessage(getLang("invalidNumber", n), event.threadID);

        try {
          await api.leaveGroup(Reply.pending[index - 1].threadID);
          count++;
        } catch (e) {
          console.error(e);
        }
      }

      return api.sendMessage(getLang("cancelSuccess", count), event.threadID);
    }

    // ✅ APPROVE
    const nums = body.split(/\s+/);
    for (const n of nums) {
      const index = parseInt(n);
      if (!index || index < 1 || index > Reply.pending.length)
        return api.sendMessage(getLang("invalidNumber", n), event.threadID);

      const targetThread = Reply.pending[index - 1].threadID;

      try {
        await api.addUserToGroup(api.getCurrentUserID(), targetThread);

        const info = await api.getThreadInfo(targetThread);
        api.sendMessage(
`✅ Bot approved successfully!
👥 Group: ${info.threadName || "Unnamed"}
👤 Members: ${info.participantIDs.length}`,
          targetThread
        );

        count++;
      } catch (e) {
        console.error(e);
      }
    }

    return api.sendMessage(getLang("approveSuccess", count), event.threadID);
  },

  // ================== ON START ==================
  onStart: async ({ api, event, getLang, commandName }) => {
    try {
      const pending = await api.getThreadList(500, null, ["PENDING"]);
      const list = pending.filter(t => t.isGroup);

      if (!list.length)
        return api.sendMessage(getLang("returnListClean"), event.threadID);

      let msg = "";
      list.forEach((g, i) => {
        msg += `✧ ${i + 1}. ${g.name || "Unnamed"}\n  ☞ ID: ${g.threadID}\n`;
      });

      api.sendMessage(
        getLang("returnListPending", list.length, msg),
        event.threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              author: event.senderID,
              pending: list
            });
          }
        }
      );
    } catch (e) {
      console.error(e);
      api.sendMessage(getLang("cantGetPendingList"), event.threadID);
    }
  }
};