const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "myqueen",
    author: "Hasib",
    version: "2.3",
    category: "love",
    role: 0,
    shortDescription: { en: "💘 Random love match by reply or mention" },
    longDescription: { en: "Generates a random love match image between two users." },
    guide: { en: "{p}{n} reply or mention someone" }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      /* -------- SENDER -------- */
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData.name;

      /* -------- TARGET -------- */
      let targetID;

      if (event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      } else {
        return api.sendMessage(
          "⚠️ Reply to someone's message or mention a user.",
          event.threadID,
          event.messageID
        );
      }

      if (targetID === event.senderID) {
        return api.sendMessage(
          "❌ You cannot match with yourself!",
          event.threadID,
          event.messageID
        );
      }

      const targetData = await usersData.get(targetID);
      const targetName = targetData.name;

      /* -------- CANVAS -------- */
      const width = 960;
      const height = 547;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const bg = await loadImage(
        "https://i.postimg.cc/dQgn42LC/IMG-20260109-WA0000.jpg"
      );
      ctx.drawImage(bg, 0, 0, width, height);

      const drawCircle = (img, x, y, size) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      };

      const senderImg = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720`
      );
      const targetImg = await loadImage(
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720`
      );

      drawCircle(senderImg, 105, 162, 255);
      drawCircle(targetImg, 599, 162, 255);

      /* -------- SAVE IMAGE -------- */
      const outputPath = path.join(__dirname, "myqueen.png");
      const out = fs.createWriteStream(outputPath);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        // 🔥 RANDOM EVERY TIME
        const lovePercent = Math.floor(Math.random() * 101); // 0–100

        const message =
`💍 𝐅𝐮𝐭𝐮𝐫𝐞 𝐋𝐢𝐟𝐞 𝐏𝐚𝐫𝐭𝐧𝐞𝐫 💍

${senderName} ❤️ ${targetName}

✨ Destiny works in mysterious ways ✨
❤️ Love Percentage: ${lovePercent}%`;

        api.sendMessage(
          {
            body: message,
            attachment: fs.createReadStream(outputPath)
          },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (err) {
      api.sendMessage(
        "❌ Error: " + err.message,
        event.threadID,
        event.messageID
      );
    }
  }
};