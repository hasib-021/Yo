const axios = require("axios");

module.exports = {
  config: {
    name: "bmdp",
    aliases: ["boysmatchingdp" , "bdp"],
    version: "1.0",
    author: "Hasib",
    countDown: 5,
    role: 0,
    shortDescription: "Random Boys Matching DP",
    longDescription: "Send random Boys Matching DP",
    category: "image",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://xsaim8x-xxx-api.onrender.com/api/bmdp");
      const { boy, boy2 } = res.data;

      api.sendMessage(
        {
          body: "",
          attachment: await Promise.all([
            global.utils.getStreamFromURL(boy),
            global.utils.getStreamFromURL(boy2)
          ])
        },
        event.threadID,
        event.messageID
      );
    } catch (e) {
      api.sendMessage("❌ Couldn't fetch BMDP.", event.threadID, event.messageID);
      console.error(e);
    }
  }
};
