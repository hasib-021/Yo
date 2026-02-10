const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61557991443492";

module.exports = {
  config: {
    name: "slap4",
    aliases:["buttslap2"],
    version: "1.7",
    author: "Hasib",
    countDown: 5,
    role: 0,
    shortDescription: "Buttslap image",
    longDescription: "Generate a funny buttslap meme image",
    category: "meme",
    guide: {
      en: "{pn} @tag or reply to someone's message"
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người muốn tát",
      ownerError: "Bạn không thể tát chủ bot!"
    },
    en: {
      noTag: "You must tag the person you want to slap or reply to their message",
      ownerError: "You cannot slap the owner!"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      const uid1 = event.senderID;
      let uid2 = Object.keys(event.mentions)[0];

      // If no mention, check if it's a reply
      if (!uid2 && event.messageReply) uid2 = event.messageReply.senderID;

      if (!uid2) return message.reply(getLang("noTag"));

      // Prevent slapping the owner
      if (uid2 === OWNER_UID) return message.reply(getLang("ownerError"));

      // Get avatar URLs
      const avatarURL1 = await usersData.getAvatarUrl(uid1);
      const avatarURL2 = await usersData.getAvatarUrl(uid2);

      // Generate meme image
      const imgBuffer = await new DIG.Spank().getImage(avatarURL1, avatarURL2);

      // Save temporarily
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
      const filePath = path.join(tmpDir, `${uid1}_${uid2}_spank.png`);
      fs.writeFileSync(filePath, Buffer.from(imgBuffer));

      // Remove the mention from content
      const content = args.join(" ").replace(Object.keys(event.mentions)[0] || "", "").trim();

      // Reply with image
      message.reply(
        {
          body: content || "hehe boii 😏",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath) // Delete after sending
      );
    } catch (err) {
      console.error(err);
      message.reply("⚠️ Something went wrong while generating the image!");
    }
  }
};
