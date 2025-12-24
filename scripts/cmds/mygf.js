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

      // ===== PAIR LOGIC =====
      if (mentionIDs.length >= 2) {
        const filtered = mentionIDs.filter(id => id !== senderID);
        if (filtered.length < 2) {
          return api.sendMessage(
            "⚠️ Please mention two different users.",
            event.threadID,
            event.messageID
          );
        }
        user1ID = filtered[0];
        user2ID = filtered[1];
      } 
      else if (mentionIDs.length === 1 && mentionIDs[0] !== senderID) {
        user1ID = senderID;
        user2ID = mentionIDs[0];
      } 
      else if (repliedUserID && repliedUserID !== senderID) {
        user1ID = senderID;
        user2ID = repliedUserID;
      }

      let baseUserID;
      let matchName;
      let kingAvatar;
      let queenAvatar;

      // ===== MANUAL PAIR =====
      if (user1ID && user2ID) {
        const u1 = users.find(u => u.id === user1ID);
        const u2 = users.find(u => u.id === user2ID);

        if (!u1 || !u2 || !u1.gender || !u2.gender) {
          return api.sendMessage("⚠️ Gender not detected.", event.threadID);
        }

        if (u1.gender === u2.gender) {
          return api.sendMessage("⚠️ Same gender pairing not allowed.", event.threadID);
        }

        baseUserID = user1ID;
        matchName = u2.name;

        kingAvatar = await loadImage(
          `https://graph.facebook.com/${user1ID}/picture?width=512&height=512`
        );
        queenAvatar = await loadImage(
          `https://graph.facebook.com/${user2ID}/picture?width=512&height=512`
        );
      }

      // ===== RANDOM PAIR =====
      else {
        const sender = users.find(u => u.id === senderID);
        if (!sender || !sender.gender) {
          return api.sendMessage("⚠️ Gender not detected.", event.threadID);
        }

        const candidates =
          sender.gender === "MALE"
            ? users.filter(u => u.gender === "FEMALE" && u.id !== senderID)
            : users.filter(u => u.gender === "MALE" && u.id !== senderID);

        if (!candidates.length) {
          return api.sendMessage("❌ No match found.", event.threadID);
        }

        const match = candidates[Math.floor(Math.random() * candidates.length)];

        baseUserID = senderID;
        matchName = match.name;

        kingAvatar = await loadImage(
          `https://graph.facebook.com/${senderID}/picture?width=512&height=512`
        );
        queenAvatar = await loadImage(
          `https://graph.facebook.com/${match.id}/picture?width=512&height=512`
        );
      }

      const baseUserData = await usersData.get(baseUserID);
      const senderName = baseUserData.name;

      // ===== CANVAS SETUP =====
      const canvasWidth = 1344;
      const canvasHeight = 768;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      // Background
      const background = await loadImage(
        "https://i.postimg.cc/59D7gqVr/1766515447900.jpg"
      );
      ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

      // ===== AVATAR SETTINGS =====
      const circleSize = 350; // inner white circle
      const border = 10;
      const avatarY = (canvasHeight - circleSize) / 2;

      const kingX = 260;
      const queenX = canvasWidth - circleSize - 260;

      function drawAvatarWithWhiteCircle(ctx, img, x, y, size) {
        // White circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();

        // Avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          x + size / 2,
          y + size / 2,
          size / 2 - border,
          0,
          Math.PI * 2
        );
        ctx.clip();

        ctx.drawImage(
          img,
          x + border,
          y + border,
          size - border * 2,
          size - border * 2
        );
        ctx.restore();
      }

      drawAvatarWithWhiteCircle(ctx, kingAvatar, kingX, avatarY, circleSize);
      drawAvatarWithWhiteCircle(ctx, queenAvatar, queenX, avatarY, circleSize);

      // ===== OUTPUT =====
      const outputPath = path.join(__dirname, "mygf_output.png");
      const out = fs.createWriteStream(outputPath);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        const love = Math.floor(Math.random() * 31) + 70;

        api.sendMessage(
          {
            body:
              `👑 𝗞𝗶𝗻𝗴 & 𝗤𝘂𝗲𝗲𝗻 𝗣𝗮𝗶𝗿 💕\n\n` +
              `👤 ${senderName}\n` +
              `💖 ${matchName}\n` +
              `💘 Love: ${love}%`,
            attachment: fs.createReadStream(outputPath),
          },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (e) {
      api.sendMessage("❌ Error:\n" + e.message, event.threadID);
    }
  },
};
