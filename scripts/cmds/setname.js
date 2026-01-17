const PROTECTED_UID = "61557991443492";

module.exports = {
	config: {
		name: "setname",
		aliases:["setnickname","setnick"],
		version: "2.0",
		author: "Hasib",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Change nickname by reply, mention, or clear own nickname"
		},
		category: "box chat"
	},

	langs: {
		en: {
			protected: "😏 koto boro sahos",
			error: "⚠️ | Failed to change nickname."
		}
	},

	onStart: async function ({ args, event, api }) {

		let targetUIDs = [];
		let nickname = args.join(" ").trim(); 
		const senderUID = event.senderID;

		if (event.messageReply) {
			targetUIDs.push(event.messageReply.senderID);
		}

		const mentions = Object.keys(event.mentions || {});
		if (mentions.length) {
			targetUIDs = mentions;
			for (const uid of mentions) {
				// remove mention text from nickname
				nickname = nickname.replace(event.mentions[uid], "").trim();
			}
		}

		if (!targetUIDs.length) {
			targetUIDs.push(senderUID);
		}
		for (const uid of targetUIDs) {

		
			if (uid === PROTECTED_UID && senderUID !== PROTECTED_UID) {
				await api.sendMessage(getLang("protected"), event.threadID);
				continue;
			}
		
			try {
				await api.changeNickname(nickname, event.threadID, uid);
			}
			catch {
				await api.sendMessage(getLang("error"), event.threadID);
			}
		}
	}
};
