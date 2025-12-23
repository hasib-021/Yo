const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "mygf",
    author: "Hasib",
    category: "love",
    usePrefix: true,
    role: 0,
    description: "Claim someone as your GF/BF (opposite gender only)",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const senderID = event.senderID;
      const mentions = Object.keys(event.mentions || {});
      const repliedID = event.messageReply ? event.messageReply.senderID : null;

      let partnerID = null;

      // Only allow one mention or reply
      if (mentions.length === 1 && mentions[0] !== senderID) {
        partnerID = mentions[0];
      } else if (repliedID && repliedID !== senderID) {
        partnerID = repliedID;
      } else {
        return api.sendMessage(
          "💔 To claim your love:\n" +
          "• Mention one person (@tag)\n" +
          "• Or reply to their message\n\n" +
          "Only opposite gender allowed ❤️",
          event.threadID,
          event.messageID
        );
      }

      // Get user data
      const senderData = await usersData.get(senderID);
      const partnerData = await usersData.get(partnerID);

      if (!senderData || !partnerData) {
        return api.sendMessage("❌ Unable to get user information.", event.threadID);
      }

      // STRICT: Opposite gender only
      if (senderData.gender === partnerData.gender || 
          !senderData.gender || !partnerData.gender) {
        return api.sendMessage(
          "⚠️ Sorry, this command only works for opposite gender pairs ❤️\n" +
          "(Male ↔ Female only)",
          event.threadID,
          event.messageID
        );
      }

      const senderName = senderData.name;
      const partnerName = partnerData.name;

      // Load avatars
      const avatarSender = await loadImage(
        `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const avatarPartner = await loadImage(
        `https://graph.facebook.com/${partnerID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      // King & Queen template
      const background = await loadImage("https://i.postimg.cc/8c0bK0qJ/king-queen-pair-template.png");

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(background, 0, 0);

      const avatarSize = 320;
      const leftX = 80;
      const rightX = canvas.width - 80 - avatarSize;
      const centerY = canvas.height / 2;

      const drawCircularAvatar = (img, x, y, size) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      };

      // Male always on King (left), Female on Queen (right)
      if (senderData.gender === "MALE") {
        // Sender (male) → King side, Partner (female) → Queen side
        drawCircularAvatar(avatarSender, leftX, centerY - avatarSize / 2, avatarSize);
        drawCircularAvatar(avatarPartner, rightX, centerY - avatarSize / 2, avatarSize);
      } else {
        // Sender (female) → Queen side, Partner (male) → King side
        drawCircularAvatar(avatarPartner, leftX, centerY - avatarSize / 2, avatarSize);
        drawCircularAvatar(avatarSender, rightX, centerY - avatarSize / 2, avatarSize);
      }

      const outputPath = path.join(__dirname, "cache", "mygf_opposite.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;
        const marriagePercent = Math.floor(Math.random() * 31) + 70;

        const futureLines = [
          "You two will build a beautiful life together, full of love, laughter, and endless adventures ❤️",
          "One day you'll walk down the aisle, exchange rings, and start your forever journey 💍",
          "Your future holds a cozy home, sweet children, and growing old hand in hand 👨‍👩‍👧‍👦🏡",
          "You'll create countless memories, travel the world, and always choose each other 🌍✨",
          "Together, you'll face every storm and celebrate every sunrise – a perfect love story 🌅",
          "Your love will only grow stronger with time, leading to a beautiful marriage and happy family 💞",
          "You'll be each other's home, best friend, and greatest adventure for life 🏡❤️",
          "The universe brought you together for a lifetime of happiness and unbreakable bond ♾️"
        ];

        const futureLine = futureLines[Math.floor(Math.random() * futureLines.length)];

        const title = senderData.gender === "MALE" ? "My Girlfriend ❤️" : "My Boyfriend ❤️";

        api.sendMessage({
          body:
            `💕 ${title} 💕\n\n` +
            `👑 King: ${senderData.gender === "MALE" ? senderName : partnerName}\n` +
            `👸 Queen: ${senderData.gender === "MALE" ? partnerName : senderName}\n\n` +
            `💖 Love Match: ${lovePercent}%\n` +
            `💍 Chance of Marriage: ${marriagePercent}%\n\n` +
            `🔮 Future Together:\n"${futureLine}"`,
          attachment: fs.createReadStream(outputPath)
        }, event.threadID, () => fs.unlinkSync(outputPath), event.messageID);
      });

    } catch (error) {
      console.error(error);
      api.sendMessage("❌ An error occurred: " + error.message, event.threadID);
    }
  }
};
