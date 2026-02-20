module.exports = {
	config: {
		name: "Hasib",
		version: "1.4",
		author: "NTKhang (modified)",
		countDown: 60,
		role: 2,
		description: {
			vi: "làm mới thông tin nhóm chat hoặc người dùng",
			en: "refresh information of group chat or user"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [thread | group]: làm mới thông tin nhóm chat của bạn"
				+ "\n   {pn} group <threadID>: làm mới thông tin nhóm chat theo ID"
				+ "\n\n   {pn} user: làm mới thông tin người dùng của bạn"
				+ "\n   {pn} user [<userID> | @tag]: làm mới thông tin người dùng theo ID",
			en: "   {pn} [thread | group]: refresh information of your group chat"
				+ "\n   {pn} group <threadID>: refresh information of group chat by ID"
				+ "\n\n   {pn} user: refresh information of your user"
				+ "\n   {pn} user [<userID> | @tag]: refresh information of user by ID"
		}
	},

	langs: {
		vi: {
			workingRefreshUser: "🔄 | Đang làm mới thông tin người dùng, vui lòng đợi...",
			refreshMyThreadSuccess: "✅ | Đã làm mới thông tin nhóm chat của bạn thành công!",
			refreshThreadTargetSuccess: "✅ | Đã làm mới thông tin nhóm chat %1 thành công!",
			errorRefreshMyThread: "❌ | Đã xảy ra lỗi không thể làm mới thông tin nhóm chat của bạn",
			errorRefreshThreadTarget: "❌ | Đã xảy ra lỗi không thể làm mới thông tin nhóm chat %1",
			refreshMyUserSuccess: "✅ | Đã làm mới thông tin người dùng của bạn thành công!",
			refreshUserTargetSuccess: "✅ | Đã làm mới thông tin người dùng %1 thành công!",
			errorRefreshMyUser: "❌ | Đã xảy ra lỗi không thể làm mới thông tin người dùng của bạn",
			errorRefreshUserTarget: "❌ | Đã xảy ra lỗi không thể làm mới thông tin người dùng %1"
		},
		en: {
			workingRefreshUser: "🔄 | Refreshing user information, please wait...",
			refreshMyThreadSuccess: "✅ | Refresh information of your group chat successfully!",
			refreshThreadTargetSuccess: "✅ | Refresh information of group chat %1 successfully!",
			errorRefreshMyThread: "❌ | Error when refresh information of your group chat",
			errorRefreshThreadTarget: "❌ | Error when refresh information of group chat %1",
			refreshMyUserSuccess: "✅ | Refresh information of your user successfully!",
			refreshUserTargetSuccess: "✅ | Refresh information of user %1 successfully!",
			errorRefreshMyUser: "❌ | Error when refresh information of your user",
			errorRefreshUserTarget: "❌ | Error when refresh information of user %1"
		}
	},

	onStart: async function ({ args, threadsData, message, event, usersData, getLang }) {

		// GROUP / THREAD REFRESH
		if (args[0] === "group" || args[0] === "thread") {
			const targetID = args[1] || event.threadID;

			// processing reaction
			await message.react("⏳");

			try {
				await threadsData.refreshInfo(targetID);
				await message.react("✅");
				return message.reply(
					targetID == event.threadID
						? getLang("refreshMyThreadSuccess")
						: getLang("refreshThreadTargetSuccess", targetID)
				);
			}
			catch (error) {
				await message.react("❌");
				return message.reply(
					targetID == event.threadID
						? getLang("errorRefreshMyThread")
						: getLang("errorRefreshThreadTarget", targetID)
				);
			}
		}

		// USER REFRESH
		else if (args[0] === "user") {
			let targetID = event.senderID;

			if (args[1]) {
				if (Object.keys(event.mentions).length)
					targetID = Object.keys(event.mentions)[0];
				else
					targetID = args[1];
			}

			// working reaction + message
			await message.react("⏳");
			await message.reply(getLang("workingRefreshUser"));

			try {
				await usersData.refreshInfo(targetID);
				await message.react("✅");
				return message.reply(
					targetID == event.senderID
						? getLang("refreshMyUserSuccess")
						: getLang("refreshUserTargetSuccess", targetID)
				);
			}
			catch (error) {
				await message.react("❌");
				return message.reply(
					targetID == event.senderID
						? getLang("errorRefreshMyUser")
						: getLang("errorRefreshUserTarget", targetID)
				);
			}
		}

		else {
			return message.SyntaxError();
		}
	}
};
