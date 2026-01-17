const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

const OWNER_UID = "61557991443492";

module.exports = {
  config: {
    name: "latti",
    aliases: ["usta","kik"],
    version: "1.0.4",
    author: "Hasib",
    countDown: 5,
    role: 0,
    longDescription: "{p}latthi @mention or reply someone to kick them 🦶",
    category: "funny",
    guide: "{p}latthi and mention or reply to someone 🦶",
    usePrefix: true,
    premium: false,
  },

  onStart: async function ({ api, message, event }) {
    const eAuth = "SGFzaWI="; // base64 of 'Hasib'
    const dAuth = Buffer.from(eAuth, "base64").toString("utf8");

    // AUTHOR PROTECTION
    if (module.exports.config.author !== dAuth) {
      return message.reply(
        "Author name has been changed! Set it to 'Hasib' otherwise this command will not work. 🙂"
      );
    }

    const senderID = event.senderID;
    let targetID;

    // Priority: mention > reply
    const mentionKeys = Object.keys(event.mentions || {});
    if (mentionKeys.length > 0) {
      targetID = mentionKeys[0];
    } else if (event.type === "message_reply" && event.messageReply) {
      targetID = event.messageReply.senderID;
    } else {
      return message.reply(
        "Kake latthi marte chao? Mention ba reply koro 🌚"
      );
    }

    // OWNER PROTECTION
    if (targetID === OWNER_UID) {
      return message.reply("Ehh sokh koto😼");
    }

    try {
      const getAvatar = async (uid) => {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        return await loadImage(Buffer.from(res.data));
      };

      const canvas = createCanvas(950, 850);
      const ctx = canvas.getContext("2d");

      const [background, senderAvatar, targetAvatar] = await Promise.all([
        loadImage("https://i.imgur.com/3DZjUH7.jpeg"),
        getAvatar(senderID),
        getAvatar(targetID),
      ]);

      // Background
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Sender Avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(180, 250, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(senderAvatar, 95, 165, 170, 170);
      ctx.restore();

      // Target Avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(700, 120, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(targetAvatar, 615, 35, 170, 170);
      ctx.restore();

      // Save temp file
      const tmpDir = `${__dirname}/tmp`;
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const outputPath = `${tmpDir}/latthi_${senderID}.png`;
      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      message.reply(
        {
          body: "Usta kha! 🦶😵",
          attachment: fs.createReadStream(outputPath),
        },
        () => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
      );
    } catch (err) {
      console.error("Latthi Error:", err);
      message.reply(
        "Profile picture load korte somossya hoyeche. Abar chesta korun. 🐸"
      );
    }
  },
};
