const axios = require("axios");
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
  config: {
    name: "slap3",
    aliases: ["battslap3"],
    version: "1.1",
    author: "Hasib",
    countDown: 5,
    role: 0,
    shortDescription: "buttslap someone",
    longDescription: "",
    category: "Entertainment",
    guide: "{pn} @tag OR reply"
  },

  onStart: async function ({ message, event }) {
    try {
      const uid1 = event.senderID;

      // 🟢 GET TARGET USER (reply first, then mention)
      let uid2;
      if (event.messageReply) {
        uid2 = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        uid2 = Object.keys(event.mentions)[0];
      }

      if (!uid2) {
        return message.reply("❌ Reply to someone or tag someone to slap!");
      }

      // ❌ Restricted user check
      if (uid2 === "61578365162382") {
        return message.reply("who the hell are you moron ‍😒");
      }

      // 🖼️ Load avatars
      const avone = await jimp.read(
        `https://graph.facebook.com/${uid1}/picture?width=512&height=512`
      );
      avone.circle();

      const avtwo = await jimp.read(
        `https://graph.facebook.com/${uid2}/picture?width=512&height=512`
      );
      avtwo.circle();

      // 🖼️ Base image
      const img = await jimp.read(
        "https://i.postimg.cc/W3NwfQTB/butt.png"
      );

      img
        .resize(720, 405)
        .composite(avone.resize(90, 90), 368, 34)
        .composite(avtwo.resize(90, 90), 190, 225);

      const path = "butt.png";
      await img.writeAsync(path);

      return message.reply({
        body: "𝕞𝕠𝕧𝕖 𝕪𝕠𝕦𝕣 𝕓𝕦𝕥𝕥 🍑",
        attachment: fs.createReadStream(path)
      });

    } catch (err) {
      console.error(err);
      message.reply("⚠️ Something went wrong. Try again later.");
    }
  }
};
