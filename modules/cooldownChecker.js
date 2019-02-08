const {capitalize} = require("../modules/functions.js");

const cdMessages = [
	"You're calling me fast enough that I'm getting dizzy!",
	"Watch out, seems like we might get a speeding ticket at this rate!",
	"You have to wait before using the command again...",
	"You're calling me a bit too fast, I am getting dizzy!",
	"I am busy, try again after a bit",
	"Hang in there before using this command again...",
	"Wait up, I am not done with my break"
];

function getIdByType(message, type) {
	if (type == "user") {
		return message.author.id;
	} else if (type == "channel") {
		return message.channel.id;
	} else if (type == "guild") {
		if (message.guild) {return message.guild.id} else {return message.author.id}
	} else {
		throw new Error("Cooldown type must either be user, channel, or guild.");
	}
}

function findCooldown(bot, id, name, findIndex) {
	const filter = cd => cd.id == id && cd.name == name;
	if (findIndex) {
		return bot.cache.recentCommands.findIndex(filter);
	} else {
		return bot.cache.recentCommands.find(filter);
	}
}

/*
	Overrides are structured like this:
	{
		name: "image",
		time: 60000,
		type: "channel"
	}
*/
function addCooldown(bot, message, command, overrides) {
	if (!overrides) overrides = {};
	const cdName = overrides.name || command.name,
		cdTime = overrides.time || command.cooldown.time,
		cdId = getIdByType(message, overrides.type || command.cooldown.type);

	bot.cache.recentCommands.push({
		id: cdId,
		name: cdName,
		resets: Number(new Date()) + cdTime,
		notified: false
	});
	setTimeout(removeCooldown, cdTime, bot, cdId, cdName);
}

function removeCooldown(bot, id, name) {
	bot.cache.recentCommands.splice(findCooldown(bot, id, name, true), 1);
}

module.exports = {
	check: (bot, message, command) => {
		const cdType = command.cooldown.type,
			checkedCd = findCooldown(bot, getIdByType(message, cdType), command.cooldown.name || command.name, false);
		if (checkedCd) {
			if (!checkedCd.notified) {
				checkedCd.notified = true;
				let toSend = `⛔ **Cooldown:**\n*${cdMessages[Math.floor(Math.random() * cdMessages.length)]}*` + "\n";

				if (command.cooldown.name) {
					toSend += `${capitalize(command.cooldown.name, true)} commands`;
				} else {
					toSend += "This command";
				}
				const cdTime = ((checkedCd.resets - Number(new Date())) / 1000).toFixed(1);
				toSend += ` is on cooldown for **${cdTime > 0 ? cdTime : 0.1} more seconds**`;
				if (cdType == "channel") {
					toSend += " in this channel";
				} else if (cdType == "guild") {
					toSend += " in this guild";
				}
				message.channel.send(`${toSend}!`);
			}
			return false;
		} else {
			return true;
		}
	},
	addCooldown: addCooldown
};