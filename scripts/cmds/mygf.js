const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

// Load Facebook avatar properly
async function loadFBAvatar(uid) {
  const url = `https://graph.facebook.com/${uid}/picture?width=720&height=720`;
  const res = await axios.get(url, {
    responseType: "arraybuffer",
    maxRedirects: 5,
  });
  return await loadImage(res.data);
}

module.exports = {
  config: {
    name: "mygf",
    author: "Hasib",
    category: "LOVE",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const users = threadInfo.userInfo;

      const senderID = event.senderID;
      const mentions = Object.keys(event.mentions || {});
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
        if (!sender || !sender.gender)
          return api.sendMessage("❌ Gender not found", event.threadID);

        const opposite = users.filter(
          u => u.id !== senderID && u.gender && u.gender !== sender.gender
        );

        if (!opposite.length)
          return api.sendMessage("❌ No match found", event.threadID);

        const random = opposite[Math.floor(Math.random() * opposite.length)];
        user1ID = senderID;
        user2ID = random.id;
      }

      const user1 = await usersData.get(user1ID);
      const user2 = await usersData.get(user2ID);

      // ===== LOAD AVATARS =====
      const avatar1 = await loadFBAvatar(user1ID);
      const avatar2 = await loadFBAvatar(user2ID);

      // ===== LOAD BACKGROUND =====
      const background = await loadImage(
        "https://i.postimg.cc/RFVB0KdS/grok-image-xang5o4.jpg"
      );

      // ===== CANVAS =====
      const width = 900;
      const height = Math.floor(background.height * (width / background.width));
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, width, height);

      // ===== DRAW CIRCLE AVATAR =====
      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      // ===== AVATAR SIZE & POSITION =====
      const avatarSize = 240;
      const offsetY = -height / 18; // slightly up, about 1.8 factor adjustment

      const leftX = width * 0.09; // slightly inside left
      const leftY = height / 2 - avatarSize / 2 + offsetY;

      const rightX = width - avatarSize - width * 0.09; // slightly inside right
      const rightY = height / 2 - avatarSize / 2 + offsetY;

      drawCircle(avatar1, leftX, leftY, avatarSize);
      drawCircle(avatar2, rightX, rightY, avatarSize);

      // ===== SAVE IMAGE =====
      const outputPath = path.join(__dirname, "pair.png");
      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      const love = Math.floor(Math.random() * 31) + 70;

      // ===== SEND MESSAGE =====
      api.sendMessage(
        {
          body:
            `👑 King: ${user1.name}\n` +
            `👑 Queen: ${user2.name}\n` +
            `💖 Love: ${love}%`,
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
