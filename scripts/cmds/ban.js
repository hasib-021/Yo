const { findUid } = global.utils;
const moment = require("moment-timezone");

// 🔐 Protected UIDs
const PROTECTED_UIDS = ["61557991443492", "61587417024496"];

module.exports = {
  config: {
    name: "ban",
    version: "2.0",
    author: "Hasib",
    countDown: 5,
    role: 1, // Only admins
    category: "box chat",
    description: {
      en: "Ban / unban users from group"
    }
  },

  langs: {
    en: {
      protected: "⚠️ | This user is protected",
      notFoundTarget: "⚠️ | Please tag, reply, use UID or FB link",
      userNotBanned: "⚠️ | This user is not banned",
      unbannedSuccess: "✅ | Unbanned %1",
      cantSelfBan: "⚠️ | You can't ban yourself",
      cantBanAdmin: "❌ | You can't ban an admin",
      existedBan: "❌ | User already banned",
      noReason: "No reason",
      bannedSuccess: "✅ | Banned %1",
      noData: "📑 | No banned members",
      listBanned: "📑 | Banned list (page %1/%2)",
      content: "%1/ %2 (%3)\nReason: %4\nTime: %5\n\n",
      needAdmin: "⚠️ | Bot needs admin to kick user"
    }
  },

  onStart: async function({ message, event, args, threadsData, usersData, getLang, api }) {
    const senderID = event.senderID;
    const { members, adminIDs } = await threadsData.get(event.threadID);
    let dataBanned = await threadsData.get(event.threadID, "data.banned_ban", []);

    // Always remove protected UIDs from banned list
    for (const uid of PROTECTED_UIDS) {
      const idx = dataBanned.findIndex(i => i.id === uid);
      if (idx !== -1) dataBanned.splice(idx, 1);
    }
    await threadsData.set(event.threadID, dataBanned, "data.banned_ban");

    // ===== LIST =====
    if (args[0] === "list") {
      if (!dataBanned.length) return message.reply(getLang("noData"));

      const limit = 20;
      const page = parseInt(args[1] || 1);
      const start = (page - 1) * limit;
      const data = dataBanned.slice(start, start + limit);

      let msg = "";
      let i = start;
      for (const u of data) {
        i++;
        const name = members[u.id]?.name || await usersData.getName(u.id);
        msg += getLang("content", i, name, u.id, u.reason, u.time);
      }
      return message.reply(getLang("listBanned", page, Math.ceil(dataBanned.length / limit)) + "\n\n" + msg);
    }

    // ===== TARGET DETECTION =====
    let target;
    let reason;

    if (event.messageReply?.senderID) {
      target = event.messageReply.senderID;
      reason = args.join(" ");
    } else if (Object.keys(event.mentions || {}).length) {
      target = Object.keys(event.mentions)[0];
      reason = args.join(" ").replace(event.mentions[target], "");
    } else if (!isNaN(args[0])) {
      target = args[0];
      reason = args.slice(1).join(" ");
    } else if (args[0]?.startsWith("https")) {
      target = await findUid(args[0]);
      reason = args.slice(1).join(" ");
    } else {
      return message.reply(getLang("notFoundTarget"));
    }

    // ===== UNBAN =====
    if (args[0] === "unban" || event.body?.toLowerCase().startsWith("!unban")) {
      if (!target) return message.reply(getLang("notFoundTarget"));
      if (PROTECTED_UIDS.includes(target)) return message.reply(getLang("protected"));

      const index = dataBanned.findIndex(i => i.id == target);
      if (index === -1) return message.reply(getLang("userNotBanned"));

      dataBanned.splice(index, 1);
      await threadsData.set(event.threadID, dataBanned, "data.banned_ban");

      const name = members[target]?.name || await usersData.getName(target);
      return message.reply(getLang("unbannedSuccess", name));
    }

    // ===== BAN =====
    if (!target) return message.reply(getLang("notFoundTarget"));
    if (PROTECTED_UIDS.includes(target)) return message.reply(getLang("protected"));
    if (target === senderID) return message.reply(getLang("cantSelfBan"));
    if (adminIDs.includes(target) && !PROTECTED_UIDS.includes(senderID)) return message.reply(getLang("cantBanAdmin"));
    if (dataBanned.some(i => i.id == target)) return message.reply(getLang("existedBan"));

    const name = members[target]?.name || await usersData.getName(target);
    const time = moment().tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY");

    dataBanned.push({
      id: target,
      reason: reason || getLang("noReason"),
      time
    });

    await threadsData.set(event.threadID, dataBanned, "data.banned_ban");
    message.reply(getLang("bannedSuccess", name));

    // Auto kick if bot is admin
    if (event.participantIDs.includes(target)) {
      if (adminIDs.includes(api.getCurrentUserID())) {
        api.removeUserFromGroup(target, event.threadID);
      } else {
        message.reply(getLang("needAdmin"));
      }
    }
  }
};
