const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

// Background and default avatar
const bgURL = "https://i.imgur.com/ep1gG3r.png";
const defaultAvatarPath = path.join(__dirname, "cache", "default_avatar.png");
const localBgPath = path.join(__dirname, "cache", "batgiam_bg.png");

// Avatar positions + size
const avatarConfig = {
  sender: { x: 375, y: 9, size: 100 },
  mention: { x: 160, y: 92, size: 100 }
};

module.exports = {
  config: {
    name: "arrest",
    version: "1.0",
    author: "Hasib",
    countDown: 5,
    role: 0,
    description: "💞 Creates a cute batgiam image with your tagged partner!",
    category: "love",
    guide: {
      en: "{pn} @tag or reply — Create a batgiam image 💞"
    }
  },

  langs: {
    en: {
      noTag: "Please tag someone or reply to create a batgiam image 💞"
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    const uid1 = event.senderID;
    let uid2 = Object.keys(event.mentions)[0];

    if (!uid2 && event.messageReply?.senderID) uid2 = event.messageReply.senderID;
    if (!uid2) return message.reply(getLang("noTag"));

    try {
      const name1 = (await usersData.getName(uid1)) || "Unknown";
      const name2 = (await usersData.getName(uid2)) || "Unknown";

      // Ensure cache folder and download background
      await fs.ensureDir(path.dirname(localBgPath));
      if (!fs.existsSync(localBgPath)) {
        const bgRes = await axios.get(bgURL, { responseType: "arraybuffer", timeout: 10000 });
        await fs.writeFile(localBgPath, bgRes.data);
      }

      const [avatarURL1, avatarURL2] = await Promise.all([
        usersData.getAvatarUrl(uid1).catch(() => defaultAvatarPath),
        usersData.getAvatarUrl(uid2).catch(() => defaultAvatarPath)
      ]);

      const [img1, img2, bgImg] = await Promise.all([
        loadImage(avatarURL1),
        loadImage(avatarURL2),
        loadImage(localBgPath)
      ]);

      // Canvas same size as background
      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0);

      // Draw circular avatars
      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircle(img1, avatarConfig.sender.x, avatarConfig.sender.y, avatarConfig.sender.size);
      drawCircle(img2, avatarConfig.mention.x, avatarConfig.mention.y, avatarConfig.mention.size);

      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      const randomID = Math.floor(Math.random() * 1000000);
      const imgPath = path.join(tmpDir, `batgiam_${randomID}.png`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/png"));

      await message.reply({
        body: ``,
        attachment: fs.createReadStream(imgPath)
      });

      // ✅ No cleanup, image will stay in tmp folder

    } catch (err) {
      console.error("❌ Error in batgiam.js:", err);
      return message.reply("❌ Failed to create batgiam image.");
    }
  }
};
