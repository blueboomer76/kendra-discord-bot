const Command = require("../structures/command.js"),
	promptor = require("../modules/codePromptor.js");

module.exports = [
	class AddRoleCommand extends Command {
		constructor() {
			super({
				name: "addrole",
				description: "Adds a role to a user. It will be logged if a modlog channel was set",
				aliases: ["ar", "giverole", "setrole"],
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "member"
					},
					{
						infiniteArgs: true,
						type: "role"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "role",
						desc: "Role to give",
						arg: {
							num: 1,
							type: "role"
						}
					},
					{
						name: "user",
						desc: "User to give the role to",
						arg: {
							num: 1,
							type: "member"
						}
					}
				],
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "addrole <user> <role>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0], role = args[1];
			if (role.comparePositionTo(message.guild.me.highestRole) >= 0) return {cmdErr: `I cannot add the role **${role.name}** to **${member.user.tag}** because its position is at or higher than mine.`};
			if (member.roles.has(role.id)) return {cmdWarn: `That member already has the role **${role.name}**.`};
				
			member.addRole(role)
				.then(() => message.channel.send(`✅ Role **${role.name}** has been added to **${member.user.tag}**.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class BanCommand extends Command {
		constructor() {
			super({
				name: "ban",
				description: "Bans a user. It will be logged if a modlog channel was set",
				args: [
					{
						infiniteArgs: true,
						type: "member"
					},
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "days",
						desc: "Number of days to delete messages",
						arg: {
							num: 1,
							type: "number",
							min: 0,
							max: 14
						}
					},
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							num: 1,
							type: "string"
						}
					},
					{
						name: "yes",
						desc: "Skips the confirmation dialog"
					}
				],
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				},
				usage: "ban <user> [--days <1-14>] [--reason <reason>] [--yes]"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0],
				daysFlag = flags.find(f => f.name == "days"),
				reasonFlag = flags.find(f => f.name == "reason");
			if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) return {cmdErr: `I cannot ban the member **${member.user.tag}** because their highest role is at or higher than mine.`};
			
			if (!flags.some(f => f.name == "yes")) {
				const promptRes = await promptor.prompt(message, `You are about to ban the user **${member.user.tag}** from this guild.`);
				if (promptRes) return {cmdWarn: promptRes};
			}
			
			member.ban({
				days: daysFlag ? daysFlag.args[0] : 0,
				reason: reasonFlag ? reasonFlag.args[0] : null
			})
				.then(() => message.channel.send(`✅ The user **${member.user.tag}** was banned from the guild.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class CreateChannelCommand extends Command {
		constructor() {
			super({
				name: "createchannel",
				description: "Create a text channel with a given name",
				aliases: ["addch", "addchannel", "createch"],
				args: [
					{
						type: "string"
					},
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				},
				usage: "createchannel <name>"
			});
		}
		
		async run(bot, message, args, flags) {
			const channelNameRegex = /[^0-9a-z-_]+/, channelName = args[0].toLowerCase();
			if (channelNameRegex.test(channelName)) return {cmdWarn: "Channel names can only have numbers, lowercase letters, hyphens, or underscores."};
				
			message.guild.createChannel(channelName)
				.then(channel => message.channel.send(`✅ The channel **${channel.name}** has been created.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class CreateRoleCommand extends Command {
		constructor() {
			super({
				name: "createrole",
				description: "Creates a guild role. It will be logged if a modlog channel was set",
				aliases: ["crrole"],
				args: [
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "createrole <name>"
			});
		}
		
		async run(bot, message, args, flags) {
			message.guild.createRole({name: args[0]})
				.then(role => message.channel.send(`✅ Role **${role.name}** has been created.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class DeleteChannelCommand extends Command {
		constructor() {
			super({
				name: "deletechannel",
				description: "Deletes a channel",
				aliases: ["delch", "delchannel", "deletech"],
				args: [
					{
						infiniteArgs: true,
						type: "channel"
					},
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "yes",
						desc: "Skips the confirmation dialog"
					}
				],
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				},
				usage: "deletechannel <name> [--yes]"
			});
		}
		
		async run(bot, message, args, flags) {
			const channel = args[0];
			if (channel.createdTimestamp + 1.5552e+10 < Date.now() && !flags.some(f => f.name == "yes")) {
				const promptRes = await promptor.prompt(message, `You are about to delete the channel **${channel.name}** (ID ${channel.id}), which is more than 180 days old.`);
				if (promptRes) return {cmdWarn: promptRes};
			}
			
			channel.delete()
				.then(() => message.channel.send(`✅ The channel **${channel.name}** has been deleted.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class DeleteRoleCommand extends Command {
		constructor() {
			super({
				name: "deleterole",
				description: "Deletes a role",
				aliases: ["delr", "delrole", "deleter"],
				args: [
					{
						infiniteArgs: true,
						type: "role"
					},
				],
				cooldown: {
					time: 30000,
					type: "user"
				},
				flags: [
					{
						name: "yes",
						desc: "Skips the confirmation dialog"
					}
				],
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "deleterole <name>"
			});
		}
		
		async run(bot, message, args, flags) {
			const role = args[0];
			if (role.comparePositionTo(message.guild.me.highestRole) >= 0) return {cmdErr: `I cannot delete the role **${role.name}** because its position is at or higher than mine.`};
			if (role.members.size > 10 && role.members.size > message.guild.memberCount / 10 && !flags.some(f => f.name == "yes")) {
				const promptRes = await promptor.prompt(message, `You are about to delete the role **${role.name}** (ID ${role.name}), which more than 10% of the members in this server have.`);
				if (promptRes) return {cmdWarn: promptRes};
			}
			
			role.delete()
				.then(() => message.channel.send(`✅ The role **${role.name}** has been deleted.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class HackbanCommand extends Command {
		constructor() {
			super({
				name: "hackban",
				description: "Bans a user even if that user is not in this server. It will be logged if a modlog channel was set",
				args: [
					{
						errorMsg: "Please provide a valid user ID.",
						type: "function",
						testFunction: obj => {
							const objInt = parseInt(obj);
							return !isNaN(obj) && objInt.length >= 17 && objInt.length < 19;
						}
					}
				],
				cooldown: {
					time: 25000,
					type: "user"
				},
				flags: [
					{
						name: "days",
						desc: "Number of days to delete messages",
						arg: {
							num: 1,
							type: "number",
							min: 0,
							max: 14
						}
					},
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							num: 1,
							type: "string"
						}
					}
				],
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				},
				usage: "hackban <user id> [--days <1-14>] [--reason <reason>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const userId = parseInt(args[0]),
				daysFlag = flags.find(f => f.name == "days"),
				reasonFlag = flags.find(f => f.name == "reason");
				
			message.guild.ban(userId, {
				days: daysFlag ? daysFlag.args[0] : 0,
				reason: reasonFlag ? reasonFlag.args[0] : null
			})
				.then(() => message.channel.send(`✅ The user with ID **${userId}** was banned from the guild.`))
				.catch(() => message.channel.send("Could not ban the user with that ID. Make sure to check for typos in the ID and that the user is not already banned."));
		}
	},
	class KickCommand extends Command {
		constructor() {
			super({
				name: "kick",
				description: "Kicks a member. It will be logged if a modlog channel was set",
				args: [
					{
						infiniteArgs: true,
						type: "member"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							num: 1,
							type: "string"
						}
					}
				],
				perms: {
					bot: ["KICK_MEMBERS"],
					user: ["KICK_MEMBERS"],
					level: 0
				},
				usage: "kick <user> [--reason <reason>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0], reasonFlag = flags.find(f => f.name == "reason");
			if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) return {cmdWarn: `I cannot kick the member **${member.user.tag}** because their highest role is at or higher than mine.`};
			
			const promptRes = await promptor.prompt(message, `You are about to kick the user **${args[0].user.tag}** from this guild.`);
			if (promptRes) return {cmdWarn: promptRes};
			
			member.kick(reasonFlag ? reasonFlag.args[0] : null)
				.then(() => message.channel.send(`✅ The user **${member.user.tag}** was kicked from the guild.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class MuteCommand extends Command {
		constructor() {
			super({
				name: "mute",
				description: "Mutes a user from sending messages in this channel",
				args: [
					{
						infiniteArgs: true,
						type: "member"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				},
				usage: "mute <user>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0];
			if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) return {cmdWarn: `I cannot mute the member **${member.user.tag}** because their highest role is at or higher than mine.`};
			if (!message.channel.permissionsFor(member).has("SEND_MESSAGES")) return {cmdWarn: `**${member.user.tag}** is already muted or cannot send messages in this channel.`};
			message.channel.overwritePermissions(member, {
				SEND_MESSAGES: false
			})
				.then(() => message.channel.send(`✅ The user **${member.user.tag}** was muted in this channel.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class PurgeCommand extends Command {
		constructor() {
			super({
				name: "purge",
				description: "Deletes messages from a channel. You can specify options for deleting from 1-100 messages to refine the messages selected",
				aliases: ["clear", "prune"],
				args: [
					{
						type: "number",
						min: 1,
						max: 500
					},
					{
						infiniteArgs: true,
						optional: true,
						parseSeperately: true,
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "invert",
						desc: "Inverts the messages selected"
					},
					{
						name: "text",
						desc: "Filter messages containing text",
						arg: {
							num: 1,
							type: "string"
						}
					},
					{
						name: "user",
						desc: "Filter messages from a user",
						arg: {
							num: 1,
							type: "member"
						}
					}
				],
				perms: {
					bot: ["MANAGE_MESSAGES"],
					user: ["MANAGE_MESSAGES"],
					level: 0
				},
				usage: "purge <1-500> OR purge <1-100> [attachments] [bots] [embeds] [images] [invites] [left] [links] [mentions] [reactions] [--user <user>] [--text <text>] [--invert]"
			});
			this.options = ["attachments", "bots", "embeds", "images", "invites", "left", "links", "mentions", "reactions"];
		}
		
		async run(bot, message, args, flags) {
			await message.delete();

			const deleteLarge = args[0] > 100;
			let toDelete = args[0];

			if (args[1] || flags.length > 0) {
				if (deleteLarge) return {cmdWarn: "Options are not supported for deleting from more than 100 messages at a time."};
				const invalidArg = args.slice(1).find(arg => !this.options.includes(arg));
				if (invalidArg) {
					if (invalidArg == "text" || invalidArg == "user") {
						return {cmdWarn: `You need to use the flag version of the \`${invalidArg}\` option: \`--${invalidArg}\` <query>`};
					} else {
						return {cmdWarn: "Invalid option specified: " + invalidArg};
					}
				}
				let fetchErr;
				await message.channel.fetchMessages({limit: toDelete})
					.then(messages => {
						let toDelete2 = messages;
						if (args[1]) {
							for (const option of args.slice(1)) {
								let filter;
								switch (option) {
									case "attachments":
										filter = msg => msg.attachments.size > 0;
										break;
									case "bots":
										filter = msg => msg.author.bot;
										break;
									case "embeds":
										filter = msg => msg.embeds[0];
										break;
									case "images":
										filter = msg => msg.embeds[0] && (msg.embeds[0].type == "image" || msg.embeds[0].image);
										break;
									case "invites":
										filter = msg => /(www\.)?(discord\.(gg|me|io)|discordapp\.com\/invite)\/[0-9a-z]+/gi.test(msg.content);
										break;
									case "left":
										filter = msg => msg.member == null;
										break;
									case "links":
										filter = msg => /https?:\/\/\S+\.\S+/gi.test(msg.content) || (msg.embeds[0] && msg.embeds.some(e => e.type == "article" || e.type == "link"));
										break;
									case "mentions":
										filter = msg => {
											const mentions = msg.mentions;
											return mentions.everyone || mentions.members.size > 0 || mentions.roles.size > 0 || mentions.users.size > 0;
										};
										break;
									case "reactions":
										filter = msg => msg.reactions.size > 0;
										break;
								}
								toDelete2 = toDelete2.filter(filter);
							}
						}
						const textFlag = flags.find(f => f.name == "text"),
							userFlag = flags.find(f => f.name == "user");
						if (textFlag) toDelete2 = toDelete2.filter(msg => msg.content.includes(textFlag.args[0]));
						if (userFlag) toDelete2 = toDelete2.filter(msg => msg.member.id == userFlag.args[0].id);
						if (flags.some(f => f.name == "invert")) {
							const toDeleteIds = toDelete2.map(m => m.id);
							toDelete = messages.map(m => m.id).filter(id => !toDeleteIds.includes(id));
						} else {
							toDelete = toDelete2;
						}
					})
					.catch(err => fetchErr = err);
				if (fetchErr) {
					console.log(fetchErr);
					return {cmdWarn: "Failed to fetch messages"};
				}
			} else if (deleteLarge) {
				const promptRes = await promptor.prompt(message, `You are about to delete ${toDelete} messages from this channel.`);
				if (promptRes) return {cmdWarn: promptRes};
			}

			if (deleteLarge) {
				const iters = Math.ceil(args[0] / 100);
				for (let i = 0; i < iters; i++) {
					let deleteErr;
					await message.channel.bulkDelete(i == iters - 1 ? toDelete % 100 : 100, true)
						.catch(err => deleteErr = "Could not delete all messages: ```" + err + "```");
					if (deleteErr) return {cmdWarn: deleteErr};
				}
				message.channel.send(`🗑 Deleted ${args[0]} messages from this channel!`).then(m => m.delete(7500));
			} else {
				message.channel.bulkDelete(toDelete, true)
					.then(messages => {
						const msgAuthors = messages.map(m => m.author.tag), deleteDistrib = {};
						let breakdown = "", deleteAfter = 4500;
						for (const author of msgAuthors) {
							deleteDistrib[author] = (deleteDistrib[author] || 0) + 1;
						}
						for (const author in deleteDistrib) {
							breakdown += ` **\`${author}\`** - ${deleteDistrib[author]}` + "\n";
							deleteAfter += 500;
						}
						message.channel.send(`🗑 Deleted ${messages.size} messages from this channel!` + "\n\n" + "__**Breakdown**__:" + "\n" + breakdown)
							.then(m => {
								m.delete(deleteAfter < 10000 ? deleteAfter : 10000).catch(() => {});
							});
					})
					.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
			}
		}
	},
	class RemoveRoleCommand extends Command {
		constructor() {
			super({
				name: "removerole",
				description: "Removes a role a user has. It will be logged if a modlog channel was set",
				aliases: ["rr", "takerole"],
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "member"
					},
					{
						infiniteArgs: true,
						type: "role"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_ROLES"],
					user: ["MANAGE_ROLES"],
					level: 0
				},
				usage: "removerole <user> <role>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0], role = args[1];
			if (!member.roles.has(role.id)) return {cmdWarn: `**${member.user.tag}** does not have a role named **${role.name}**.`};
			if (role.comparePositionTo(message.guild.me.highestRole) >= 0) return {cmdWarn: `I cannot remove the role **${role.name}** from **${member.user.tag}** because its position is at or higher than mine.`};
				
			member.removeRole(role)
				.then(() => message.channel.send(`✅ Role **${role.name}** has been removed from **${member.user.tag}**.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class RenameChannelCommand extends Command {
		constructor() {
			super({
				name: "renamechannel",
				description: "Renames this channel",
				aliases: ["rnch", "renamech", "setchname", "setchannelname"],
				args: [
					{
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				},
				usage: "renamechannel <name>"
			});
		}
		
		async run(bot, message, args, flags) {
			const newChannelName = args[0].toLowerCase();
			if (/^[0-9a-z-_]+$/.test(newChannelName)) return {cmdWarn: "Channel names can only have numbers, lowercase letters, hyphens, or underscores."};
				
			message.channel.setName(newChannelName)
				.then(() => message.channel.send(`✅ This channel's name has been set to **${newChannelName}**.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class ResetNicknameCommand extends Command {
		constructor() {
			super({
				name: "resetnickname",
				description: "Remove a member's nickname. It will be logged if a modlog channel was set",
				aliases: ["removenick", "removenickname", "resetnick"],
				args: [
					{
						infiniteArgs: true,
						type: "member"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_NICKNAMES"],
					user: ["MANAGE_NICKNAMES"],
					level: 0
				},
				usage: "resetnickname <user>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0];
			if (member.nickname == null) return {cmdWarn: `**${member.user.tag}** does not have a nickname in this guild.`};
				
			member.setNickname("")
				.then(() => message.channel.send(`✅ Nickname of **${member.user.tag}** has been reset.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class SetNicknameCommand extends Command {
		constructor() {
			super({
				name: "setnickname",
				description: "Changes a member's nickname. It will be logged if a modlog channel was set",
				aliases: ["changenick", "setnick"],
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "member"
					},
					{
						infiniteArgs: true,
						type: "string"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_NICKNAMES"],
					user: ["MANAGE_NICKNAMES"],
					level: 0
				},
				usage: "setnickname <user> <new nick>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0], newNick = args[1];
			
			member.setNickname(newNick)
				.then(() => message.channel.send(`✅ Nickname of **${member.user.tag}** has been set to **${newNick}.**`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	},
	class SoftbanCommand extends Command {
		constructor() {
			super({
				name: "softban",
				description: "Bans a user, deletes messages, then unbans that user",
				args: [
					{
						allowQuotes: true,
						infiniteArgs: true,
						type: "member"
					},
					{
						missingArgMsg: "You need to provide a number of days to delete messages. Use `ban` without the `days` option instead if you do not want to delete any messages, or `kick` to simply remove the member.",
						type: "number",
						min: 1,
						max: 14
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				flags: [
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							num: 1,
							type: "string"
						}
					},
					{
						name: "yes",
						desc: "Skips the confirmation dialog"
					}
				],
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				},
				usage: "softban <user> <days: 1-14> [--reason <reason>] [--yes]"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0], reasonFlag = flags.find(f => f.name == "reason");
			if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) return {cmdErr: `I cannot softban the member **${member.user.tag}** because their highest role is at or higher than mine.`};
			
			if (!flags.some(f => f.name == "yes")) {
				const promptRes = await promptor.prompt(message, `You are about to softban the user **${member.user.tag}** in this guild.`);
				if (promptRes) return {cmdWarn: promptRes};
			}
			
			member.ban({
				days: args[1],
				reason: reasonFlag ? reasonFlag.args[0] : null
			})
				.then(() => {
					message.guild.unban(member.user.id)
						.then(() => message.channel.send(`✅ The user **${member.user.tag}** was softbanned.`))
						.catch(() => message.channel.send("An error has occurred while trying to unban the member."));
				})
				.catch(err => message.channel.send("An error has occurred while trying to ban the member: ```" + err + "```"));
		}
	},
	class UnbanCommand extends Command {
		constructor() {
			super({
				name: "unban",
				description: "Unbans a user. It will be logged if a modlog channel was set",
				args: [
					{
						errorMsg: "Please provide a valid user ID.",
						type: "function",
						testFunction: obj => {
							const objInt = parseInt(obj);
							return !isNaN(obj) && objInt.length >= 17 && objInt.length < 19;
						}
					}
				],
				cooldown: {
					time: 25000,
					type: "user"
				},
				flags: [
					{
						name: "reason",
						desc: "Reason to put in the audit log",
						arg: {
							num: 1,
							type: "string"
						}
					}
				],
				perms: {
					bot: ["BAN_MEMBERS"],
					user: ["BAN_MEMBERS"],
					level: 0
				},
				usage: "unban <user id> [--reason <reason>]"
			});
		}
		
		async run(bot, message, args, flags) {
			const userId = parseInt(args[0]),
				reasonFlag = flags.find(f => f.name == "reason");
				
			message.guild.unban(userId, reasonFlag ? reasonFlag.args[0] : null)
				.then(() => message.channel.send(`✅ The user with ID **${userId}** was unbanned from the guild.`))
				.catch(() => message.channel.send("Could not unban the user with that ID. Make sure to check for typos in the ID and that the user is in the ban list."));
		}
	},
	class UnmuteCommand extends Command {
		constructor() {
			super({
				name: "unmute",
				description: "Allows a muted user to send messages in this channel",
				args: [
					{
						infiniteArgs: true,
						type: "member"
					}
				],
				cooldown: {
					time: 20000,
					type: "user"
				},
				perms: {
					bot: ["MANAGE_CHANNELS"],
					user: ["MANAGE_CHANNELS"],
					level: 0
				},
				usage: "unmute <user>"
			});
		}
		
		async run(bot, message, args, flags) {
			const member = args[0];
			if (member.highestRole.comparePositionTo(message.guild.me.highestRole) >= 0) return {cmdWarn: `I cannot unmute the member **${member.user.tag}** because their highest role is at or higher than mine.`};
			if (message.channel.permissionsFor(member).has("SEND_MESSAGES")) return {cmdWarn: `**${member.user.tag}** is not muted or is able to send messages in this channel.`};
			message.channel.overwritePermissions(member, {
				SEND_MESSAGES: true
			})
				.then(() => message.channel.send(`✅ The user **${member.user.tag}** was unmuted in this channel.`))
				.catch(err => message.channel.send("Oops! An error has occurred: ```" + err + "```"));
		}
	}
];