const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");


const bgURL = "https://i.imgur.com/3laJwc1.jpg";
const localBgPath = path.join(__dirname, "cache", "kiss4_bg.jpg");


const avatarConfig = {
  sender: { x: 200, y: 300, size: 350 },
  mention: { x: 600, y: 80, size: 350 }
};

module.exports = {
  config: {
    name: "kiss4",
    version: "1.0",
    author: "Hasib",
    countDown: 5,
    role: 0,
    description: "💋 Create a romantic kiss4 image with your tagged partner!",
    category: "love",
    guide: {
      en: "{pn} @tag or reply — Create a kiss4 image 💞"
    }
  },

  langs: {
    en: {
      noTag: "Please tag someone or reply to create a kiss4 image 💋"
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

      
      const canvas = createCanvas(bgImg.width, bgImg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0);

      
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
      const imgPath = path.join(tmpDir, `${uid1}_${uid2}_kiss4.jpg`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/jpeg"));

      await message.reply({
        body: `💋 ${name1} just kissed ${name2}! ❤️`,
        attachment: fs.createReadStream(imgPath)
      });

      

    } catch (err) {
      console.error("❌ Error in kiss4.js:", err);
      return message.reply("❌ Failed to create kiss4 image.");
    }
  }
};
