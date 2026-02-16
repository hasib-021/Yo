const { config } = global.GoatBot;

// Only allowed users
const ALLOWED = ["61587417024496", "61557991443492"];

module.exports = {
  config: {
    name: "auid",
    aliases: ["aul"],
    version: "1.0",
    author: "Hasib",
    countDown: 5,
    role: 0,
    shortDescription: "Show admin names with UID",
    category: "Owner"
  },

  onStart: async function ({ message, usersData, event }) {
    const senderID = event.senderID;

    // Restrict command
    if (!ALLOWED.includes(senderID))
      return message.reply("This cmd doesn't exist, please type!help to see available cmd");

    // Combine owners + admins
    const allAdmins = [...new Set([
      ...ALLOWED,
      ...config.adminBot
    ])];

    let list = [];

    for (const uid of allAdmins) {
      const name = await usersData.getName(uid);
      list.push(`• ${name}\n  UID: ${uid}`);
    }

    if (!list.length) list.push("No admins found.");

    return message.reply(
`👑 ADMIN LIST WITH UID 👑
━━━━━━━━━━━━━━━
${list.join("\n\n")}`
    );
  }
};
