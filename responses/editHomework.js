const {EmbedBuilder} = require('discord.js');
const db = require('../database.js');
module.exports = {
    data: {
        name: 'homeworkeditmodal',
    },
    async execute(interaction) {
        try {
            const homeworkId = interaction.customId.split('_')[1];

            // Retrieve input values from the modal
            const subject = interaction.fields.getTextInputValue('subjectInput').trim();
            const topic = interaction.fields.getTextInputValue('topicInput').trim();
            const description = interaction.fields.getTextInputValue('descriptionInput').trim();
            const dueDate = interaction.fields.getTextInputValue('dueDateInput').trim();

            // Validate date format (dd.mm.yyyy)
            const match = dueDate.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (!match) {
                return interaction.reply({
                    content: '❌ Datum ve špatném formátu, použij `dd.mm.yyyy` např. `12.10.2026`',
                    ephemeral: true,
                });
            }

            const [, day, month, year] = match;
            const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`);
            if (isNaN(date)) {
                return interaction.reply({
                    content: '❌ Špatně zadané datum.',
                    ephemeral: true,
                });
            }

            const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');

            db.run(
                'UPDATE homework SET subject = ?, topic = ?, description = ?, due_date = ? WHERE id = ?',
                [subject.toUpperCase(), topic.capitalize(), description.capitalize(), formattedDate, homeworkId],
                async function (err) {
                    if (err) {
                        console.error('DB error:', err.message);
                        return interaction.reply({
                            content: '❌ Nepodařilo se upravit úkol.',
                            ephemeral: true,
                        });
                    }

                    db.all('SELECT message_id FROM homework WHERE id = ?', [homeworkId], async (err, result) => {
                        if (err) {
                            console.error('DB fetch error or missing message_id:', err?.message);
                            return interaction.reply({
                                content: '❌ Nepodařilo se najít zprávu pro úpravu.',
                                ephemeral: true,
                            });
                        }
                        const messageId = result[0]?.message_id;

                        const dueTimestamp = Math.floor(date.getTime() / 1000);

                        const updatedEmbed = new EmbedBuilder()
                            .setTitle(`📚 Úkol: ${topic}`)
                            .setColor(0x2ecc71)
                            .addFields(
                                {name: 'Předmět', value: subject.toUpperCase(), inline: true},
                                {name: 'Popis', value: description},
                                {name: 'Odevzdat do', value: `<t:${dueTimestamp}:F>\n<t:${dueTimestamp}:R>`}
                            )
                            .setFooter({
                                text: `Upravil: ${interaction.user.username}`,
                                iconURL: interaction.user.displayAvatarURL(),
                            })
                            .setTimestamp();

                        const channel = interaction.client.channels.cache.get(process.env.HOMEWORK_CHANNEL_ID);
                        if (!channel) {
                            return interaction.reply({
                                content: '❌ Kanál pro úkoly nebyl nalezen.',
                                ephemeral: true,
                            });
                        }
                        const message = await channel.messages.fetch(messageId);
                        await message.edit({embeds: [updatedEmbed], components: message.components});
                        await interaction.reply({
                            content: '✅ Úkol byl úspěšně upraven.',
                            ephemeral: true,
                        });

                    });
                }
            );
        } catch (error) {
            console.error('Unexpected error:', error);
            await interaction.reply({
                content: '❌ Došlo k neočekávané chybě při úpravě úkolu.',
                ephemeral: true,
            });
        }
    },
};
