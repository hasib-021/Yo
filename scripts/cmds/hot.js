const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "hot",
    aliases: ["18+", "nsfw", "sexy"],
    version: "1.0.5",
    author: "Hasib",
    countDown: 5,
    role: 2,
    shortDescription: "Send random hot video 🔥",
    longDescription: "Sends a random hot video using Amit Max Hot Video API 😏",
    category: "media",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event }) {
    // Send initial message
    const loadingMsg = await api.sendMessage("💋 𝗹𝘂𝗰𝗰𝗵𝗮𝗺𝗶 𝗰𝗵𝗲𝗿𝗲 𝗱𝗲...😒 🫦", event.threadID);

    try {
      // Fetch video info
      const res = await axios.get("https://amit-max-api-s-production.up.railway.app/api/hot");
      const data = res.data;

      if (!data || !data.status) {
        return api.editMessage("❌ Failed to get video. Try again later.", loadingMsg.messageID);
      }

      const videoUrl = data.data.download_link;
      const fileName = `${data.data.file_id}.mp4`;
      const filePath = path.join(__dirname, "cache", fileName);

      // Download video
      const video = await axios.get(videoUrl, { responseType: "arraybuffer" });
      await fs.ensureDir(path.join(__dirname, "cache"));
      fs.writeFileSync(filePath, Buffer.from(video.data, "binary"));

      // Send video message
      await api.sendMessage(
        {
          body: `☄️ Hot Video\n\n🎬 Sent: ${data.data.videos_sent}/${data.data.total_videos}\n🔥 Remaining: ${data.data.remaining_videos}`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        async () => {
          fs.unlinkSync(filePath); // clean cache
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s before removing loading message
          api.unsendMessage(loadingMsg.messageID);
        }
      );

    } catch (err) {
      console.error(err);
      api.editMessage("❌ Error fetching or sending video.", loadingMsg.messageID);
    }
  }
};
