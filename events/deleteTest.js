const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
db = require('../database.js');
module.exports =  {
    data: {
        name: 'testdelete',
    },
    async execute(interaction, args) {
        const messageId = interaction.message.id;
        db.run(`UPDATE test set message_id = (NULL) WHERE ID = ?`, [args[0]], async (err) => {
            if (err) {
                console.error(err.message);
                interaction.reply({content: 'An error occurred while deleting test.', ephemeral: true});
                return;
            }
            const channel = interaction.client.channels.cache.get(process.env.TEST_CHANNEL_ID);
            if (!channel) {
                return interaction.reply({
                    content: '❌ Kanál pro úkoly nebyl nalezen.',
                    ephemeral: true,
                });
            }
            const message = await channel.messages.fetch(messageId);
            await message.delete();
            return interaction.reply({
                content: '✅ Úkol byl úspěšně smazán.',
                ephemeral: true,
            });
        });
    }
}