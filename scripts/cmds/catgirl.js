const axios = require("axios");

module.exports = {
  config: {
    name: "catgirl",
    version: "1.0",
    author: "Hasib",
    countDown: 5,
    role: 0,
    shortDescription: "Anime catgirl",
    longDescription: "Get a random anime catgirl image",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const res = await axios.get("https://nekos.life/api/v2/img/neko");
      message.send({
        body: "🐱 Here's your neko girl~",
        attachment: await global.utils.getStreamFromURL(res.data.url)
      });
    } catch (e) {
      message.reply("⚠️ Failed to fetch catgirl.");
    }
  }
};
