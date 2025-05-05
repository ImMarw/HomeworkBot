// commands/general/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("Check the bot's latency"),
    async execute(interaction) {
        const latency = Date.now() - interaction.createdTimestamp;
        await interaction.reply(`🏓 Pong! Latency: ${latency}ms`);
    },
};
