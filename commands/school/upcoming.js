const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upcoming')
        .setNameLocalizations({ cs: 'nadcházející' }) // Czech localization
        .setDescription('List upcoming tests and homework')
        .setDescriptionLocalizations({ cs: 'Zobrazí nadcházející testy a domácí úkoly' })
        .addStringOption(option =>
            option
                .setName('type')
                .setNameLocalizations({ cs: 'typ' }) // Czech localization
                .setDescription('Filter by type: test or homework')
                .setDescriptionLocalizations({ cs: 'Filtrovat podle typu: test nebo domácí úkol' })
                .setRequired(false)
                .addChoices(
                    { name: 'test', value: 'test' },
                    { name: 'homework', value: 'homework' }
                )
        ),
    async execute(interaction) {
        let type = interaction.options.getString('type') || 'all';

        try {
            const items = await fetchUpcoming(type);
            if (!items || items.length === 0) {
                await interaction.reply({ content: 'Žádné nadcházející položky nenalezeny.', ephemeral: true });
                return;
            }

            const homeworks = items.filter(item => item.type === 'homework' || type === 'homework');
            const tests = items.filter(item => item.type === 'test' || type === 'test');

            const formatDate = (dateString) => {
                const date = new Date(dateString);
                return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            };

            const embeds = [];

            if (homeworks.length > 0) {
                const homeworkEmbed = new EmbedBuilder()
                    .setTitle('📚 Domácí úkoly')
                    .setColor(0x2ecc71)
                    .setFooter({ text: 'Školní plánovač' });

                for (const hw of homeworks) {
                    homeworkEmbed.addFields({
                        name: `📘 ${hw.subject} – ${hw.topic}`,
                        value: `📝 ${hw.description}\n📅 Termín: **${formatDate(hw.due_date)}**`,
                        inline: false
                    });
                }
                embeds.push(homeworkEmbed);
            }

            if (tests.length > 0) {
                const testEmbed = new EmbedBuilder()
                    .setTitle('🧪 Testy')
                    .setColor(0xe67e22)
                    .setFooter({ text: 'Školní plánovač' });

                for (const test of tests) {
                    testEmbed.addFields({
                        name: `📘 ${test.subject} – ${test.topic}`,
                        value: `📝 ${test.description}\n📅 Termín: **${formatDate(test.due_date)}**`,
                        inline: false
                    });
                }
                embeds.push(testEmbed);
            }

            await interaction.reply({ embeds });

        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Došlo k chybě při získávání dat.', ephemeral: true });
        }
    },
};

async function fetchUpcoming(type = 'all') {
    let sql;

    switch (type) {
        case 'homework':
            sql = 'SELECT subject, topic, description, due_date FROM homework WHERE due_date > current_timestamp';
            break;
        case 'test':
            sql = 'SELECT subject, topic, description, due_date FROM test WHERE due_date > current_timestamp';
            break;
        case 'all':
            sql = `
                SELECT subject, topic, description, due_date, 'homework' AS type
                FROM homework
                WHERE due_date > current_timestamp
                UNION ALL
                SELECT subject, topic, description, due_date, 'test' AS type
                FROM test
                WHERE due_date > current_timestamp
            `;
            break;
        default:
            throw new Error('Invalid type specified. Expected "homework", "test", or "all".');
    }

    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}
