const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
require('dotenv').config();



module.exports = {
    data: new SlashCommandBuilder()
        .setName('homework')
        .setNameLocalizations({ 'cs': 'úkol' })
        .setDescription('Adds a new test')
        .setDescriptionLocalizations({ cs: 'Přidá nový úkol' })
        .addStringOption(opt =>
            opt
                .setName('subject')
                .setDescription('Subject abbreviation, e.g., Ma, Čj')
                .setDescriptionLocalizations({ cs: 'Zkratka předmětu, např. Ma, Čj' })
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt
                .setName('topic')
                .setDescription('Title of the homework')
                .setDescriptionLocalizations({ cs: 'Nadpis úkolu' })
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt
                .setName('description')
                .setDescription('Details about the homework')
                .setDescriptionLocalizations({ cs: 'Detaily ohledně úkolu' })
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt
                .setName('until')
                .setDescription('Due date, e.g., dd.mm.yyyy')
                .setDescriptionLocalizations({ cs: 'Datum, např. dd.mm.yyyy' })
                .setRequired(true)
        ),
    async execute(interaction) {
        const fields = ['subject', 'topic', 'description', 'until'];
        const data = Object.fromEntries(fields.map(f => [f, interaction.options.getString(f)?.trim()]));
        const { subject, topic, description, until } = data;

        const match = until.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (!match) return interaction.reply({ content: '❌ Datum ve špatném formátu, použij `dd.mm.yyyy` např. `12.10.2026`', ephemeral: true });

        const [, d, m, y] = match;
        const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00`);
        if (isNaN(date)) return interaction.reply({ content: '❌ Špatně zadané datum.', ephemeral: true });

        const formatted = date.toISOString().slice(0, 19).replace('T', ' ');

        db.run(
            'INSERT INTO homework (subject, topic, description, due_date, user_id) VALUES (?, ?, ?, ?, ?)',
            [subject.toUpperCase(), topic.capitalize(), description.capitalize(), formatted, interaction.user.id],
            async function (err) {
                if (err) {
                    console.error('DB error:', err.message);
                    return interaction.reply({ content: '❌ Nepodařilo se přidat úkol.', ephemeral: true });
                }

                const homeworkId = this.lastID;
                const dueTimestamp = Math.floor(date.getTime() / 1000);

                const embed = new EmbedBuilder()
                    .setTitle(`📚 Úkol: ${topic}`)
                    .setColor(0x2ecc71)
                    .addFields(
                        { name: 'Předmět', value: subject.toUpperCase(), inline: true },
                        { name: 'Nadpis', value: topic.capitalize() },
                        { name: 'Popis', value: description.capitalize() },
                        { name: 'Odevzdat do', value: `<t:${dueTimestamp}:F>\n<t:${dueTimestamp}:R>` }
                    )
                    .setFooter({ text: `Přidal: ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                const editButton = new ButtonBuilder()
                    .setCustomId(`homeworkedit_${homeworkId}`)
                    .setEmoji('✏️')
                    .setLabel('Upravit')
                    .setStyle(ButtonStyle.Primary)

                const deleteButton = new ButtonBuilder()
                    .setCustomId(`homeworkdelete_${homeworkId}`)
                    .setLabel('🗑️ Smazat')
                    .setStyle(ButtonStyle.Danger)

                const row = new ActionRowBuilder().addComponents(editButton, deleteButton);
                const channel = interaction.client.channels.cache.get(process.env.HOMEWORK_CHANNEL_ID);
                if (!channel) {
                    return interaction.reply({ content: '❌ Kanál pro úkoly nebyl nalezen.', ephemeral: true });
                }

                const message = await channel.send({ embeds: [embed], components: [row] });

                db.run('UPDATE homework SET message_id = ? WHERE id = ?', [message.id, homeworkId]);

                return interaction.reply({ content: `✅ Úkol byl přidán do kanálu ${channel}`, ephemeral: true });
            }
        );
    },
};


