const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setNameLocalizations({ cs: 'pomoc' })
        .setDescription('Seznam všech funkcí a příkazů')
        .setDescriptionLocalizations({ cs: 'Seznam všech funkcí a příkazů' })
        .addStringOption(option =>
            option
                .setName('command')
                .setNameLocalizations({ cs: 'příkaz' })
                .setDescription('Vysvětlí specifický příkaz')
                .setDescriptionLocalizations({ cs: 'Vysvětlí specifický příkaz' })
                .setRequired(false)
                .addChoices(
                    { name: 'help', value: 'help' },
                    { name: 'notifyme', value: 'notify' },
                    { name: 'ping', value: 'ping' },
                    { name: 'homework', value: 'homework' },
                    { name: 'test', value: 'test' },
                    { name: 'upcoming', value: 'upcoming' },
                )
        ),
    async execute(interaction) {
        const command = interaction.options.getString('command');

        const embeds = {
            help: new EmbedBuilder()
                .setTitle('/pomoc')
                .setDescription('Zobrazí seznam všech příkazů nebo detailně vysvětlí konkrétní příkaz.')
                .addFields(
                    { name: 'Použití', value: 'Zadej `/pomoc` pro zobrazení všech příkazů nebo `/pomoc příkaz:název` pro detailní informace o konkrétním příkazu.' }
                ),
            notify: new EmbedBuilder()
                .setTitle('/upozorneni')
                .setDescription('Přepíná roli pro upozorňování na domácí úkoly a testy.')
                .addFields(
                    { name: 'Použití', value: 'Zadej `/upozorneni` pro zapnutí nebo vypnutí upozornění na úkoly a testy.' }
                ),
            ping: new EmbedBuilder()
                .setTitle('/ping')
                .setDescription('Zobrazí latenci bota (odezvu).')
                .addFields(
                    { name: 'Použití', value: 'Zadej `/ping` pro zjištění odezvy bota.' }
                ),
            homework: new EmbedBuilder()
                .setTitle('/úkol')
                .setDescription('Přidá nový domácí úkol.')
                .addFields(
                    { name: 'Použití', value: 'Zadej `/úkol` s následujícími parametry:' },
                    { name: 'subject', value: 'Zkratka předmětu, např. Ma, Čj', inline: true },
                    { name: 'topic', value: 'Název úkolu', inline: true },
                    { name: 'description', value: 'Detaily k úkolu', inline: true },
                    { name: 'until', value: 'Datum odevzdání (dd.mm.yyyy)', inline: true }
                ),
            test: new EmbedBuilder()
                .setTitle('/test')
                .setDescription('Přidá nový test.')
                .addFields(
                    { name: 'Použití', value: 'Zadej `/test` s následujícími parametry:' },
                    { name: 'subject', value: 'Zkratka předmětu, např. Ma, Čj', inline: true },
                    { name: 'topic', value: 'Název testu', inline: true },
                    { name: 'description', value: 'Detaily k testu', inline: true },
                    { name: 'until', value: 'Datum konání (dd.mm.yyyy)', inline: true }
                ),
            upcoming: new EmbedBuilder()
                .setTitle('/nadcházející')
                .setDescription('Zobrazí nadcházející domácí úkoly a testy.')
                .addFields(
                    { name: 'Použití', value: 'Zadej `/nadcházející` pro zobrazení všech nadcházejících úkolů a testů nebo `/nadcházející typ:test` či `/nadcházející typ:homework` pro filtrování podle typu.' }
                ),
            all: new EmbedBuilder()
                .setTitle('📘 Seznam dostupných příkazů')
                .setDescription('Použij `/pomoc příkaz:název` pro detailní informace o konkrétním příkazu.')
                .addFields(
                    {
                        name: '/pomoc',
                        value: 'Zobrazí seznam všech příkazů nebo detailně vysvětlí konkrétní příkaz.',
                    },
                    {
                        name: '/upozorneni',
                        value: 'Přepíná roli pro upozorňování na domácí úkoly a testy.',
                    },
                    {
                        name: '/ping',
                        value: 'Zobrazí latenci bota (odezvu).',
                    },
                    {
                        name: '/úkol',
                        value: 'Přidá nový domácí úkol s předmětem, názvem, popisem a termínem odevzdání.',
                    },
                    {
                        name: '/test',
                        value: 'Přidá nový test s předmětem, názvem, popisem a datem konání.',
                    },
                    {
                        name: '/nadcházející',
                        value: 'Zobrazí nadcházející domácí úkoly a testy. Lze filtrovat podle typu.',
                    }
                )
        };

        if (command) {
            return interaction.reply({ embeds: [embeds[command]], ephemeral: true });
        } else {
            return interaction.reply({ embeds: [embeds['all']], ephemeral: true });
        }
    },
};
