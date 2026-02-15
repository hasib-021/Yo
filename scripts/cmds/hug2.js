const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

const bgURL = "https://i.imgur.com/7lPqHjw.jpg";
const localBgPath = path.join(__dirname, "cache", "hug_bg.jpg");

const avatarConfig = {
  user1: { x: 200, y: 50, size: 220 },
  user2: { x: 490, y: 200, size: 220 }
};

module.exports = {
  config: {
    name: "hug2",
    version: "2.1",
    author: "Hasib",
    countDown: 5,
    role: 0,
    description: "🤗 Create a lovely hug image",
    category: "love",
    guide: {
      en: "{pn} @tag or reply"
    }
  },

  langs: {
    en: {
      noTag: "Please tag someone or reply to hug them 🤗"
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    const uid1 = event.senderID;
    let uid2 = Object.keys(event.mentions)[0];

    if (!uid2 && event.messageReply?.senderID)
      uid2 = event.messageReply.senderID;

    if (!uid2)
      return message.reply(getLang("noTag"));

    try {
      const name1 = (await usersData.getName(uid1)) || "Unknown";
      const name2 = (await usersData.getName(uid2)) || "Unknown";

      await fs.ensureDir(path.dirname(localBgPath));
      if (!fs.existsSync(localBgPath)) {
        const bgRes = await axios.get(bgURL, {
          responseType: "arraybuffer",
          timeout: 10000
        });
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

      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImg, 0, 0, 800, 600);

      function drawCircle(img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      drawCircle(img1, avatarConfig.user1.x, avatarConfig.user1.y, avatarConfig.user1.size);
      drawCircle(img2, avatarConfig.user2.x, avatarConfig.user2.y, avatarConfig.user2.size);

      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      const imgPath = path.join(tmpDir, `${uid1}_${uid2}_hug.jpg`);
      await fs.writeFile(imgPath, canvas.toBuffer("image/jpeg"));

      await message.reply({
        body: `🤗 ${name1} hugged ${name2}! ❤️`,
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      }, 5000);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to create hug image.");
    }
  }
};
