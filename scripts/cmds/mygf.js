const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "mygf",
    author: "Hasib (Perfect fit template)",
    category: "love",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      // ================= USER DATA =================
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData?.name || "Unknown";

      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      const myData = users.find(u => u.id === event.senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage(
          "⚠️ Could not determine your gender.",
          event.threadID,
          event.messageID
        );
      }

      const myGender = myData.gender;
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(
          u => u.gender === "FEMALE" && u.id !== event.senderID
        );
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(
          u => u.gender === "MALE" && u.id !== event.senderID
        );
      } else {
        return api.sendMessage(
          "⚠️ Gender undefined. Cannot find match.",
          event.threadID,
          event.messageID
        );
      }

      if (!matchCandidates.length) {
        return api.sendMessage(
          "❌ No suitable match found in the group.",
          event.threadID,
          event.messageID
        );
      }

      const selectedMatch =
        matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      const matchName = selectedMatch.name || "Unknown";

      // ================= CANVAS SETUP =================
      const width = 1280;
      const height = 720;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // ================= BACKGROUND =================
      const backgroundUrl =
        "https://i.postimg.cc/RFVB0KdS/grok-image-xang5o4.jpg";
      const background = await loadImage(backgroundUrl);
      ctx.drawImage(background, 0, 0, width, height);

      // ================= PLACEHOLDER =================
      const placeholderPath = path.join(__dirname, "placeholder.png");
      const placeholder = fs.existsSync(placeholderPath)
        ? await loadImage(placeholderPath)
        : null;

      // ================= PROFILE PIC LOADER =================
      async function loadProfilePic(userId) {
        try {
          const url = `https://graph.facebook.com/${userId}/picture?width=720&height=720`;
          return await loadImage(url);
        } catch {
          return placeholder;
        }
      }

      const senderImage = await loadProfilePic(event.senderID);
      const matchImage = await loadProfilePic(selectedMatch.id);

      // ================= CIRCLE AVATAR FUNCTION =================
      function drawCircleAvatar(img, centerX, centerY, radius) {
        if (!img) return;
        ctx.save();

        // Inner dark background
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.closePath();

        // Clip avatar
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(
          img,
          centerX - radius,
          centerY - radius,
          radius * 2,
          radius * 2
        );

        ctx.restore();
      }

      // ================= AVATAR SIZE =================
      const avatarRadius = 140;

      // Left (Sender)
      drawCircleAvatar(senderImage, 320, 360, avatarRadius);

      // Right (Match)
      drawCircleAvatar(matchImage, 960, 360, avatarRadius);

      // ================= SAVE IMAGE =================
      const outputPath = path.join(__dirname, `pair_${event.senderID}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.promises.writeFile(outputPath, buffer);

      // ================= LOVE PERCENTAGE =================
      const lovePercent = Math.min(
        100,
        50 +
          Math.floor(
            (senderName.length + matchName.length) * 2 +
              Math.random() * 20
          )
      );

      const message =
        `🥰 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹 𝗽𝗮𝗶𝗿𝗶𝗻𝗴\n` +
        `・${senderName} 👑\n` +
        `・${matchName} 👑\n` +
        `💌 𝗪𝗶𝘀𝗵 𝘆𝗼𝘂 𝘁𝘄𝗼 𝗵𝘂𝗻𝗱𝗿𝗲𝗱 𝘆𝗲𝗮𝗿𝘀 𝗼𝗳 𝗵𝗮𝗽𝗽𝗶𝗻𝗲𝘀𝘀 ❤️\n` +
        `💖 𝗟𝗼𝘃𝗲 𝗣𝗲𝗿𝗰𝗲𝗻𝘁𝗮𝗴𝗲: ${lovePercent}%`;

      api.sendMessage(
        {
          body: message,
          attachment: fs.createReadStream(outputPath),
        },
        event.threadID,
        () => fs.existsSync(outputPath) && fs.unlinkSync(outputPath),
        event.messageID
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ Error while creating the pair image.\n" + err.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
