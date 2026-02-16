module.exports.config = {
    name: "chor",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "Hasib",
    description: "Scooby Doo template memes with user avatar",
    commandCategory: "Picture",
    usages: "...",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "axios": "",
        "canvas": "",
        "jimp": "",
        "node-superfetch": ""
    }
};

module.exports.circle = async (image) => {
    const jimp = global.nodemodule["jimp"];
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api }) => {
    const fs = global.nodemodule["fs-extra"];
    const Canvas = global.nodemodule["canvas"];
    const request = global.nodemodule["node-superfetch"];
    const path_toilet = __dirname + "/cache/chor_image.jpg";

    try {
        // Get target ID (mention or sender)
        const id = Object.keys(event.mentions)[0] || event.senderID;

        // Create canvas
        const canvas = Canvas.createCanvas(500, 670);
        const ctx = canvas.getContext("2d");

        // Load background
        const background = await Canvas.loadImage("https://i.imgur.com/ES28alv.png");
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Fetch avatar and make it circular
        const avatarResp = await request.get(
            `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            { responseType: "arraybuffer" }
        );
        const avatarCircle = await module.exports.circle(Buffer.from(avatarResp.body));

        // Draw circular avatar
        const avatarImg = await Canvas.loadImage(avatarCircle);
        ctx.drawImage(avatarImg, 48, 410, 111, 111);

        // Convert to buffer and save temporarily
        const imageBuffer = canvas.toBuffer();
        fs.writeFileSync(path_toilet, imageBuffer);

        // Send image and delete cache
        api.sendMessage(
            {
                body: "বলদ মেয়েদের চিপায় ধরা খাইছে😁😁",
                attachment: fs.createReadStream(path_toilet)
            },
            event.threadID,
            () => fs.unlinkSync(path_toilet),
            event.messageID
        );
    } catch (e) {
        api.sendMessage(`Error: ${e.message}`, event.threadID);
    }
};
