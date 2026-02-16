
const OWNER_IDS = ['61557991443492', '61587417024496'];

module.exports = {
  config: {
    name: "bio",
    version: "1.8",
    author: "Hasib",
    countDown: 5,
    role: 2, 
    shortDescription: {
      vi: " ",
      en: "Change bot bio",
    },
    longDescription: {
      vi: " ",
      en: "Change bot bio",
    },
    category: "owner",
    guide: {
      en: "{pn} (text)",
    },
  },

  onStart: async function ({ args, message, api, event }) {
    // 🔐 Check if sender is one of the owners
    if (!OWNER_IDS.includes(event.senderID)) {
      return api.sendMessage(
        "❌ Only the owner can use this command.",
        event.threadID,
        event.messageID
      );
    }

    // Join all arguments into a single string as the new bio
    const newBio = args.join(" ");

    // Optional: check if new bio is empty
    if (!newBio) {
      return message.reply("⚠️ Please provide a bio text to set.");
    }

    try {
      // Change bot bio
      api.changeBio(newBio);

      // Reply with confirmation
      message.reply("✅ Bot bio changed to: " + newBio);
    } catch (err) {
      console.error("Error changing bot bio:", err);
      message.reply("❌ Failed to change bot bio. Try again.");
    }
  },
};
