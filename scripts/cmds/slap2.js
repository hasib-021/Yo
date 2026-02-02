const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

const ACCESS_TOKEN = "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

module.exports = {
  config: {
    name: "slap2",
    version: "3.1",
    author: "Hasib",
    countDown: 5,
    role: 0,
    shortDescription: "Custom slap image with circular avatars",
    longDescription: "Create a slap image by tagging or replying to a user",
    category: "FUN & GAME",
    guide: { en: "{pn} @tag | reply + {pn}" }
  },

  langs: {
    en: {
      noTag: "Please mention someone or reply to a message to use this command."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {

    const uid1 = event.senderID;

    // Get target user (mention OR reply)
    let uid2;
    const mentions = Object.keys(event.mentions || {});

    if (mentions.length > 0) {
      uid2 = mentions[0];
    } else if (event.messageReply) {
      uid2 = event.messageReply.senderID;
    }

    if (!uid2) return message.reply(getLang("noTag"));

    async function getFbProfilePic(userId, width = 512, height = 512) {
      const url = `https://graph.facebook.com/${userId}/picture?width=${width}&height=${height}&access_token=${ACCESS_TOKEN}&redirect=false`;
      try {
        const res = await axios.get(url);
        return res.data.data.url;
      } catch {
        return null;
      }
    }

    const avatar1 =
      (await getFbProfilePic(uid1)) || (await usersData.getAvatarUrl(uid1));
    const avatar2 =
      (await getFbProfilePic(uid2)) || (await usersData.getAvatarUrl(uid2));

    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const templateUrl = "https://i.postimg.cc/pdX3tmTt/xalmanx211.png";

    const [template, img1, img2] = await Promise.all([
      loadImage(templateUrl),
      loadImage(avatar1),
      loadImage(avatar2)
    ]);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(template, 0, 0);

    function drawCircleAvatar(ctx, img, x, y, size) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    }

    drawCircleAvatar(ctx, img1, 165, 230, 90);
    drawCircleAvatar(ctx, img2, 235, 500, 110);

    const filePath = path.join(tmpDir, `slap_${uid1}_${uid2}.png`);
    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    message.reply(
      {
        body: "👋 THWACK!",
        attachment: fs.createReadStream(filePath)
      },
      () => {
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
    );
  }
};
