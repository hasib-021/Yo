const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "mygf",
    author: "Hasib",
    category: "love",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      // Get sender info
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData.name;

      // Get thread users
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      // Determine gender & possible matches
      const myData = users.find(u => u.id === event.senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage(
          "⚠️ Could not determine your gender.",
          event.threadID,
          event.messageID
        );
      }

      let matchList = [];
      if (myData.gender === "MALE") {
        matchList = users.filter(u => u.gender === "FEMALE" && u.id !== event.senderID);
      } else if (myData.gender === "FEMALE") {
        matchList = users.filter(u => u.gender === "MALE" && u.id !== event.senderID);
      }

      if (!matchList.length) {
        return api.sendMessage(
          "❌ No suitable match found.",
          event.threadID,
          event.messageID
        );
      }

      const match = matchList[Math.floor(Math.random() * matchList.length)];
      const matchName = match.name;

      // ===== Canvas =====
      const width = 1000;
      const height = 563;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Load background
      const bg = await loadImage("https://i.postimg.cc/RFVB0KdS/grok-image-xang5o4.jpg");
      ctx.drawImage(bg, 0, 0, width, height);

      // Load avatars
      const senderImg = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720`
      );
      const matchImg = await loadImage(
        `https://graph.facebook.com/${match.id}/picture?width=720&height=720`
      );

      // Function to draw circular avatar using center coordinates
      function drawCircle(img, centerX, centerY, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();
      }

      // Draw avatars
      drawCircle(senderImg, 250, 281, 135); // King
      drawCircle(matchImg, 750, 281, 135);  // Queen

      // Save image
      const filePath = path.join(__dirname, `pair6_${event.senderID}.png`);
      const out = fs.createWriteStream(filePath);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        const love = Math.floor(Math.random() * 31) + 70;

        const msg =
          `👑 Successful Pairing 👑\n\n` +
          `💙 King: ${senderName}\n` +
          `💖 Queen: ${matchName}\n\n` +
          `❤️ Love Percentage: ${love}%`;

        api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(filePath),
          },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );
      });

    } catch (err) {
      api.sendMessage(
        "❌ Error:\n" + err.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
