const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "upscale",
    aliases: ["4k" , "8k"],
    version: "1.4",
    author: "Hasib",
    countDown: 15,
    role: 0,
    shortDescription: { en: "Upscale image to 4K quality" },
    longDescription: { en: "Reply to an image or provide image URL to upscale" },
    category: "image",
    guide: { en: "Reply to image or type !4k <image_url>" }
  },

  onStart: async function ({ api, event, args, message }) {
    let imageUrl;

    try {
      // ⏳ Processing reaction
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      if (
        event.type === "message_reply" &&
        event.messageReply.attachments &&
        event.messageReply.attachments.length > 0
      ) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args[0] && args[0].startsWith("http")) {
        imageUrl = args[0];
      } else {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return;
      }

      const apiUrl = `https://azadx69x-4k-apis.vercel.app/api/4k?imgUrl=${encodeURIComponent(imageUrl)}`;
      const response = await axios.get(apiUrl);

      if (response.data.status !== "success" || !response.data.upscaledImage) {
        throw new Error("Upscale failed");
      }

      const imageResponse = await axios({
        method: "GET",
        url: response.data.upscaledImage,
        responseType: "stream",
        timeout: 30000
      });

      const filePath = path.join(__dirname, `/cache/upscaled_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(filePath);

      imageResponse.data.pipe(writer);

      writer.on("finish", () => {
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        message.reply({
          attachment: fs.createReadStream(filePath)
        }, () => fs.unlinkSync(filePath));
      });

      writer.on("error", () => {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      });

    } catch (err) {
      console.error("Upscale error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
