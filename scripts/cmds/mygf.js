const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "mygf",
    author: "Hasib",
    category: "LOVE",
    shortDescription: "Pair two lovers 💖",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const users = threadInfo.userInfo;

      const mentions = Object.keys(event.mentions || {});
      const senderID = event.senderID;
      const replyID =
        event.type === "message_reply"
          ? event.messageReply.senderID
          : null;

      let user1ID, user2ID;

      // ===== USER SELECTION =====
      if (mentions.length >= 2) {
        user1ID = mentions[0];
        user2ID = mentions[1];
      } else if (mentions.length === 1) {
        user1ID = senderID;
        user2ID = mentions[0];
      } else if (replyID && replyID !== senderID) {
        user1ID = senderID;
        user2ID = replyID;
      } else {
        const sender = users.find(u => u.id === senderID);
        if (!sender || !sender.gender) {
          return api.sendMessage("❌ Gender not found.", event.threadID);
        }

        const opposite = users.filter(
          u =>
            u.id !== senderID &&
            u.gender &&
            u.gender !== sender.gender
        );

        if (!opposite.length) {
          return api.sendMessage("❌ No match found.", event.threadID);
        }

        const random = opposite[Math.floor(Math.random() * opposite.length)];
        user1ID = senderID;
        user2ID = random.id;
      }

      if (!user1ID || !user2ID) {
        return api.sendMessage("❌ Unable to pair users.", event.threadID);
      }

      // ===== USER DATA =====
      const user1 = await usersData.get(user1ID);
      const user2 = await usersData.get(user2ID);

      // ===== AVATAR IMAGES =====
      const avatar1 = await loadImage(
        `https://graph.facebook.com/${user1ID}/picture?type=large`
      );
      const avatar2 = await loadImage(
        `https://graph.facebook.com/${user2ID}/picture?type=large`
      );

      // ===== BACKGROUND IMAGE (YOUR IMAGE) =====
      const background = await loadImage(
        "https://i.postimg.cc/RFVB0KdS/grok-image-xang5o4.jpg"
      );

      // ===== CANVAS SIZE =====
      const width = 900;
      const height = Math.floor(background.height * (width / background.width));

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, width, height);

      // ===== CIRCLE FUNCTION =====
      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      const avatarSize = 260;

      // Left (King)
      drawCircle(
        avatar1,
        80,
        height / 2 - avatarSize / 2,
        avatarSize
      );

      // Right (Queen)
      drawCircle(
        avatar2,
        width - avatarSize - 80,
        height / 2 - avatarSize / 2,
        avatarSize
      );

      // ===== SAVE IMAGE =====
      const outputPath = path.join(__dirname, "pair.png");
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      const love = Math.floor(Math.random() * 31) + 70;

      // ===== SEND MESSAGE =====
      api.sendMessage(
        {
          body:
            `👑 𝗞𝗶𝗻𝗴: ${user1.name}\n` +
            `👑 𝗤𝘂𝗲𝗲𝗻: ${user2.name}\n\n` +
            `💖 𝗟𝗼𝘃𝗲: ${love}%\n` +
            `✨ Perfect Match!`,
          attachment: fs.createReadStream(outputPath),
        },
        event.threadID,
        () => fs.unlinkSync(outputPath)
      );
    } catch (err) {
      api.sendMessage("❌ Error: " + err.message, event.threadID);
    }
  },
};
