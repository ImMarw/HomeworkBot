const { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
db = require('../database.js');
module.exports =  {
    data: {
        name: 'homeworkedit',
    },
    async execute(interaction, args) {
        let homeworkData = null;
        db.all(`SELECT * FROM homework WHERE id = ?`, [args[0]], async (err, rows) => {
            if (err) {
                console.error(err.message);
                interaction.reply({content: 'An error occurred while fetching homework data.', ephemeral: true});
                return;
            }

            // convert date to dd.mm.yyyy string format
            rows.forEach(row => {
                const date = new Date(row.due_date);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                row.due_date = `${day}.${month}.${year}`;
            });

            if (rows.length == 1) {
                homeworkData = rows[0];
                const modal = new ModalBuilder()
                    .setCustomId('homeworkeditmodal_' + args[0])
                    .setTitle('Edit ');


                const subjecetInput = new TextInputBuilder()
                    .setCustomId('subjectInput')
                    .setLabel("Předmět")
                    .setPlaceholder('např. Matematika, nebo Mat')
                    .setValue(homeworkData.subject || '')
                    .setStyle(TextInputStyle.Short);

                const topicInput = new TextInputBuilder()
                    .setCustomId('topicInput')
                    .setLabel("Nadpis")
                    .setPlaceholder('např. Vypočítat příklad z hodiny')
                    .setValue(homeworkData.topic || '')
                    .setStyle(TextInputStyle.Short);

                const descriptionInput = new TextInputBuilder()
                    .setCustomId('descriptionInput')
                    .setLabel("Popis")
                    .setPlaceholder('např. Příklad z tabule v dnešní hodině na konci.')
                    .setValue(homeworkData.description || '')
                    .setStyle(TextInputStyle.Paragraph);

                const dueDateInput = new TextInputBuilder()
                    .setCustomId('dueDateInput')
                    .setLabel("Termín odevzdání")
                    .setPlaceholder('např.  11.9.2001')
                    .setValue(homeworkData.due_date || '')
                    .setStyle(TextInputStyle.Short);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(subjecetInput),
                    new ActionRowBuilder().addComponents(topicInput),
                    new ActionRowBuilder().addComponents(descriptionInput),
                    new ActionRowBuilder().addComponents(dueDateInput)
                );

                await interaction.showModal(modal);
            } else {
                console.log('No homework found with the given ID.');
                interaction.reply({content: 'No homework found with the given ID.', ephemeral: true});
                return;
            }
        });
    }
}