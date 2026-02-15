const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

// Background image for marry4
const bgURL = "https://i.ibb.co/9ZZCSzR/ba6abadae46b5bdaa29cf6a64d762874.jpg";
const localBgPath = path.join(__dirname, "cache", "marry4_bg.jpg");

// Avatar positions + size
const avatarConfig = {
  sender: { x: 200, y: 70, size: 130 },
  mention: { x: 350, y: 150, size: 130 }
};

module.exports = {
  config: {
    name: "marry4",
    aliases:["married4","biya4"],
    version: "1.0",
    author: "Hasib",
    countDown: 5,
    role: 0,
    description: "💍 Create a romantic marriage image (Marry4) with your tagged partner!",
    category: "love",
    guide: {
      en: "{pn} @tag or reply — Create a romantic marriage image 💞"
    }
  },

  langs: {
    en: {
      noTag: "Please tag someone or reply to create a marriage image 💍"
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
        usersData.getAvatarUrl(uid1),
        usersData.getAvatarUrl(uid2)
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
      const imgPath = path.join(tmpDir, `${uid1}_${uid2}_marry4.jpg`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/jpeg"));

      await message.reply({
        body: `💍 ${name1} just got married to ${name2}! ❤️`,
        attachment: fs.createReadStream(imgPath)
      });

      

    } catch (err) {
      console.error("❌ Error in marry4.js:", err);
      return message.reply("❌ Failed to create marriage image.");
    }
  }
};
