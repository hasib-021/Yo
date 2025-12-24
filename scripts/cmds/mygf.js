const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "mygf",
    author: "Hasib",
    category: "TOOLS",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const mentions = event.mentions || {};
      const mentionIDs = Object.keys(mentions);
      const repliedUserID =
        event.type === "message_reply"
          ? event.messageReply.senderID
          : null;
      const senderID = event.senderID;

      let user1ID = null;
      let user2ID = null;

      // Case 1: Two mentions
      if (mentionIDs.length >= 2) {
        const filtered = mentionIDs.filter(id => id !== senderID);
        if (filtered.length < 2) {
          return api.sendMessage(
            "⚠️ Please mention two different users (not yourself).",
            event.threadID,
            event.messageID
          );
        }
        user1ID = filtered[0];
        user2ID = filtered[1];
      }
      // Case 2: One mention
      else if (mentionIDs.length === 1 && mentionIDs[0] !== senderID) {
        user1ID = senderID;
        user2ID = mentionIDs[0];
      }
      // Case 3: Reply
      else if (repliedUserID && repliedUserID !== senderID) {
        user1ID = senderID;
        user2ID = repliedUserID;
      }

      let baseUserID;
      let matchName;
      let sIdImage;
      let pairPersonImage;

      // Manual pairing
      if (user1ID && user2ID) {
        const user1 = users.find(u => u.id === user1ID);
        const user2 = users.find(u => u.id === user2ID);

        if (!user1 || !user2 || !user1.gender || !user2.gender) {
          return api.sendMessage(
            "⚠️ Couldn't determine gender for one or both users.",
            event.threadID,
            event.messageID
          );
        }

        if (user1.gender === user2.gender) {
          return api.sendMessage(
            "⚠️ Same gender pairing is not allowed.",
            event.threadID,
            event.messageID
          );
        }

        baseUserID = user1ID;
        matchName = user2.name;

        sIdImage = await loadImage(
          `https://graph.facebook.com/${user1ID}/picture?width=360&height=360&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        );
        pairPersonImage = await loadImage(
          `https://graph.facebook.com/${user2ID}/picture?width=360&height=360&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        );
      }
      // Random pairing
      else {
        const senderData = users.find(u => u.id === senderID);
        if (!senderData || !senderData.gender) {
          return api.sendMessage(
            "⚠️ Could not determine your gender.",
            event.threadID,
            event.messageID
          );
        }

        const candidates =
          senderData.gender === "MALE"
            ? users.filter(u => u.gender === "FEMALE" && u.id !== senderID)
            : users.filter(u => u.gender === "MALE" && u.id !== senderID);

        if (!candidates.length) {
          return api.sendMessage(
            "❌ No suitable match found in the group.",
            event.threadID,
            event.messageID
          );
        }

        const selectedMatch =
          candidates[Math.floor(Math.random() * candidates.length)];

        baseUserID = senderID;
        matchName = selectedMatch.name;

        sIdImage = await loadImage(
          `https://graph.facebook.com/${senderID}/picture?width=360&height=360&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        );
        pairPersonImage = await loadImage(
          `https://graph.facebook.com/${selectedMatch.id}/picture?width=360&height=360&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        );
      }

      const baseUserData = await usersData.get(baseUserID);
      const senderName = baseUserData.name;

      // ===== Canvas Part (Auto Height) =====
      const background = await loadImage(
        "https://i.postimg.cc/59D7gqVr/1766515447900.jpg"
      );

      const width = 800;
      const height = Math.floor(
        background.height * (width / background.width)
      );

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, width, height);

      // ===== Circular avatars =====
      const avatarSize = 320;

      function drawCircleImage(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      // Left avatar
      drawCircleImage(ctx, sIdImage, 50, height / 2 - avatarSize / 2, avatarSize);
      // Right avatar
      drawCircleImage(
        ctx,
        pairPersonImage,
        width - 50 - avatarSize,
        height / 2 - avatarSize / 2,
        avatarSize
      );

      const outputPath = path.join(__dirname, "pair_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;
        api.sendMessage(
          {
            body:
              `🎉 𝗣𝗮𝗶𝗿 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹!\n` +
              `👤 ${senderName}\n` +
              `💖 ${matchName}\n` +
              `💘 𝗟𝗼𝘃𝗲: ${lovePercent}%\n` +
              `💌 Wish you happiness!`,
            attachment: fs.createReadStream(outputPath),
          },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });
    } catch (err) {
      api.sendMessage(
        "❌ Error occurred:\n" + err.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
