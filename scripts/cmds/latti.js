const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "latthi",
    aliases: ["usta", "latti", "kik"],
    version: "1.0.5",
    author: "Hasib",
    countDown: 5,
    role: 0,
    longDescription: "{p}latthi @mention or reply someone to kick them 🦶",
    category: "funny",
    guide: "{p}latthi and mention or reply to someone 🦶",
    usePrefix: true,
    premium: false,
    notes: "If you change the author then the command will not work"
  },

  onStart: async function ({ api, message, event, usersData }) {
    const owner = module.exports.config;

    // 🔐 AUTHOR PROTECTION
    const eAuth = "SGFzaWI="; // Hasib
    const dAuth = Buffer.from(eAuth, "base64").toString("utf8");

    if (owner.author !== dAuth) {
      return message.reply(
        "Author name change kora hoyeche. Please set author to Hasib 🙂"
      );
    }

    let one = event.senderID;
    let two;
    const mention = Object.keys(event.mentions || {});

    if (mention.length > 0) {
      two = mention[0];
    } else if (event.type === "message_reply" && event.messageReply) {
      two = event.messageReply.senderID;
    } else {
      return message.reply(
        "Kake latthi marte chao? take mention ba reply koro 🌚"
      );
    }

    if (!two) {
      return message.reply(
        "Kake latthi marte chao? take mention ba reply koro 🌚"
      );
    }

    // 🛡️ OWNER PROTECTION (NO IMAGE)
    const OWNER_ID = "61557991443492";

    if (two === OWNER_ID) {
      let gender = "unknown";

      try {
        const userInfo = await usersData.get(two);
        gender = userInfo?.gender || "unknown";
      } catch (e) {}

      if (gender === "female") 
        return message.reply("Karim re usta na diya kiss daw bby 😘😘");
      }

      if (gender === "male") {
        return message.reply("koto boro sahos😾👋");
      }

      return message.reply("Owner er upor latthi cholbe na 😌");
    }

    try {
      // Avatar URLs
      const avatarURL1 = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarURL2 = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const getImg = async (url) => {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        return await loadImage(Buffer.from(res.data));
      };

      const canvas = createCanvas(950, 850);
      const ctx = canvas.getContext("2d");

      const [background, avatar1, avatar2] = await Promise.all([
        loadImage("https://i.imgur.com/3DZjUH7.jpeg"),
        getImg(avatarURL1),
        getImg(avatarURL2)
      ]);

      // Background
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Sender (left)
      ctx.save();
      ctx.beginPath();
      ctx.arc(180, 250, 85, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar1, 95, 165, 170, 170);
      ctx.restore();

      // Target (right)
      ctx.save();
      ctx.beginPath();
      ctx.arc(700, 120, 85, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar2, 615, 35, 170, 170);
      ctx.restore();

      const dir = `${__dirname}/tmp`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);

      const outputPath = `${dir}/latthi_${event.senderID}.png`;
      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      message.reply(
        {
          body: "Usta kha! 🦶😵",
          attachment: fs.createReadStream(outputPath)
        },
        () => {
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        }
      );
    } catch (err) {
      console.error("Latthi Error:", err);
      message.reply(
        "Profile picture load korte somossya hoyeche. Abar chesta korun 🐸"
      );
    }
  }
};
