const OWNER_UID = "61557991443492"; // Bot owner (always protected)

module.exports = {
	config: {
		name: "setname",
		aliases: ["setnickname", "setnick"],
		version: "3.0",
		author: "Hasib",
		countDown: 5,
		role: 0, // Everyone can use, owner has special rights
		shortDescription: {
			en: "Change nickname by reply, mention, or clear own nickname"
		},
		category: "box chat"
	},

	langs: {
		en: {
			protected: "😾 koto boro sahos",
			success: "✅ Nickname changed successfully!"
		}
	},

	onStart: async function ({ args, event, api, getLang }) {

		const senderUID = event.senderID;
		let targetUIDs = [];
		let nickname = args.join(" ").trim();

		// --- Determine targets ---
		if (event.messageReply) {
			targetUIDs.push(event.messageReply.senderID);
		}

		const mentions = Object.keys(event.mentions || {});
		if (mentions.length) {
			targetUIDs = mentions;
			for (const uid of mentions) {
				nickname = nickname.replace(event.mentions[uid], "").trim();
			}
		}

		// If no target, default to self
		if (!targetUIDs.length) {
			targetUIDs.push(senderUID);
		}

		// --- Process each target ---
		for (const uid of targetUIDs) {

			// Protect owner UID
			if (uid === OWNER_UID && senderUID !== OWNER_UID) {
				await api.sendMessage(getLang("protected"), event.threadID);
				continue;
			}

			// Allow clearing nickname if no text provided
			const finalNickname = nickname || "";

			// Change nickname
			try {
				await api.changeNickname(finalNickname, event.threadID, uid);
				// Optionally send success message if needed
				// await api.sendMessage(getLang("success"), event.threadID);
			} catch {}
		}
	}
};
