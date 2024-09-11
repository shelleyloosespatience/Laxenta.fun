const { EmbedBuilder } = require("discord.js"); 
const os = require("os");

module.exports = {
	name: "ping",
	description: "Shows bot latency and additional system information.",
	async execute(message, args) {
		try {
			const serverName = message.guild.name;
			const latency = Date.now() - message.createdTimestamp;
			const uptime = process.uptime();
			const memoryUsage = process.memoryUsage();
			const cpuUsage = process.cpuUsage();
			const botUptime = formatUptime(uptime);
			const totalMemory = formatBytes(os.totalmem());
			const usedMemory = formatBytes(memoryUsage.heapUsed);
			const freeMemory = formatBytes(os.freemem());

			const embed = new EmbedBuilder()
				.setColor("#0099ff")
				.setTitle("Bot Information")
				.addFields(
					{ name: "Server Name", value: serverName, inline: true },
					{ name: "Latency", value: `${latency}ms`, inline: true },
					{ name: "Uptime", value: botUptime, inline: true },
					{
						name: "CPU Time (User)",
						value: `${(cpuUsage.user / 1000000).toFixed(2)}ms`,
						inline: true,
					},
					{
						name: "CPU Time (System)",
						value: `${(cpuUsage.system / 1000000).toFixed(2)}ms`,
						inline: true,
					},
					{ name: "Total Memory", value: totalMemory, inline: true },
					{ name: "Used Memory", value: usedMemory, inline: true },
					{ name: "Free Memory", value: freeMemory, inline: true },
				)
				.setTimestamp()
				.setFooter({
					text: "Ping command",
					iconURL:
						"https://cdn.discordapp.com/avatars/1107155830274523136/ff8bdda31a853716b8bbb6b9ab436774.webp?size=1024",
				});

			await message.channel.send({ embeds: [embed] });
			console.log("Ping command executed successfully.");
		} catch (error) {
			console.error("Error executing the ping command:", error);
			message.reply("There was an error executing that command.");
		}
	},
};

function formatUptime(seconds) {
	const days = Math.floor(seconds / (3600 * 24));
	seconds %= 3600 * 24;
	const hours = Math.floor(seconds / 3600);
	seconds %= 3600;
	const minutes = Math.floor(seconds / 60);
	seconds = Math.floor(seconds % 60);

	return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function formatBytes(bytes) {
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	if (bytes === 0) return "0 Byte";
	const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
	return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}
