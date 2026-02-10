const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

// Access token added
const ACCESS_TOKEN = "350685531728|62f8ce9f74b12f84c123cc23437a4a32";

module.exports = {
  config: {
    name: "slap3",
    aliases:["buttslap"],
    version: "3.3",
    author: "Hasib",
    countDown: 5,
    role: 0,
    shortDescription: "Custom slap image",
    longDescription: "Create slap image by tag or reply",
    category: "FUN & GAME",
    guide: { en: "{pn} @tag | reply + {pn}" }
  },

  langs: {
    en: {
      noTag: "Please tag someone or reply to a message."
    }
  },

  onStart: async function ({ event, message, usersData, getLang }) {
    const uid1 = event.senderID;
    let uid2;

    const mentions = Object.keys(event.mentions || {});
    if (mentions.length > 0) uid2 = mentions[0];
    else if (event.messageReply) uid2 = event.messageReply.senderID;

    if (!uid2) return message.reply(getLang("noTag"));

    async function getFbProfilePic(uid) {
      try {
        const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=${ACCESS_TOKEN}&redirect=false&ts=${Date.now()}`;
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

    const templateUrl = "https://i.postimg.cc/W3NwfQTB/butt.png";

    const [template, img1, img2] = await Promise.all([
      loadImage(templateUrl),
      loadImage(avatar1),
      loadImage(avatar2)
    ]);

    const canvas = createCanvas(720, 405);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(template, 0, 0, 720, 405);

    function drawCircle(img, x, y, size) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    }

    drawCircle(img1, 368, 34, 90);
    drawCircle(img2, 190, 225, 90);

    const tmpDir = path.join(__dirname, "tmp");
    fs.ensureDirSync(tmpDir);

    const filePath = path.join(tmpDir, `slap_${uid1}_${uid2}.png`);
    await fs.writeFile(filePath, canvas.toBuffer("image/png"));

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
