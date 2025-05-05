// commands/general/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('template')
        .setDescription("Description"),
    async execute(interaction) {
        // do something
        await interaction.reply(`Do something`);
    },
};
