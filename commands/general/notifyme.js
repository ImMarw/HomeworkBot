const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('notify')
        .setNameLocalizations({ cs: 'upozorneni' })
        .setDescription('Toggle notifications for homework and tests')
        .setDescriptionLocalizations({ cs: 'Přepnout upozornění na domácí úkoly a testy' }),

    async execute(interaction) {
        const roleId = process.env.NOTIFY_ROLE_ID;
        const member = interaction.member;

        if (!roleId) {
            return interaction.reply({ content: '⚠️ Role ID pro upozornění není nastaveno v konfiguraci.', ephemeral: true });
        }

        const hasRole = member.roles.cache.has(roleId);

        try {
            if (hasRole) {
                await member.roles.remove(roleId);
                return interaction.reply({ content: '✅ Upozornění byla vypnuta testy a ukoly si i tak můžeš zobrazit pomocí `/upcoming`, nebo si zobrazit automatickou zprávu v příslušném kanálu.', ephemeral: true });
            } else {
                await member.roles.add(roleId);
                return interaction.reply({ content: '✅ Upozornění byla zapnuta. Každý den ti přijde oznámení ohledně nadcházejících testů.', ephemeral: true });
            }
        } catch (error) {
            console.error('Chyba při změně role:', error);
            return interaction.reply({ content: '❌ Došlo k chybě při změně role. Zkontroluj, zda má bot dostatečná oprávnění.', ephemeral: true });
        }
    },
};
