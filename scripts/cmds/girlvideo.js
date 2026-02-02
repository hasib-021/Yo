const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "girlvideo",
    aliases: ["wifeyvideo"],
    author: "Hasib",
    version: "1.1",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "Get random wifey video"
    },
    longDescription: {
      en: "Send a random wifey video"
    },
    category: "fun",
    guide: {
      en: "{p}girlvideo"
    }
  },

  onStart: async function ({ api, event, message }) {
    api.setMessageReaction("🕐", event.messageID, () => {}, true);

    try {
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      const videoPath = path.join(cacheDir, `${Date.now()}.mp4`);

      const response = await axios({
        method: "GET",
        url: "https://wifey-evzk.onrender.com/kshitiz",
        responseType: "stream"
      });

      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);

      writer.on("finish", async () => {
        await message.reply({
          body: "🎥 Random Wifey Video",
          attachment: fs.createReadStream(videoPath)
        });

        api.setMessageReaction("✅", event.messageID, () => {}, true);

        // delete video after sending
        fs.unlinkSync(videoPath);
      });

      writer.on("error", () => {
        message.reply("❌ Failed to save video.");
      });

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply("⚠️ Error while fetching video. Try again later.");
    }
  }
};
