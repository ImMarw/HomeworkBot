// commands/fun/nice.js
const { SlashCommandBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));


module.exports = {
    data: new SlashCommandBuilder()
        .setName('nice')
        .setDescription('Surprise'),
    async execute(interaction) {
        const url = 'https://api.giphy.com/v1/gifs/search';
        const params = new URLSearchParams({
            api_key: process.env.GIPHY_API_KEY,
            q: 'nice',
            limit: '10',
            offset: '0',
            rating: 'r',
            lang: 'en'
        });

        try {
            const response = await fetch(`${url}?${params}`);
            const data = await response.json();
            const gifs = data.data;

            if (gifs.length > 0) {
                const gifUrl = gifs[Math.floor(Math.random() * gifs.length)].images.original.url;
                await interaction.reply(gifUrl);
            } else {
                await interaction.reply('Ran out of gifs');
            }
        } catch (error) {
            console.error(error);
            await interaction.reply('Failed to fetch GIF from Giphy.');
        }
    },
};
