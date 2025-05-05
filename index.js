const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { startScheduler } = require('./services/notify.js');
const json = require('json');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.buttons = new Collection();
const buttonsPath = path.join(__dirname, 'events');
const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);
    if ('data' in button && 'execute' in button) {
        client.buttons.set(button.data.name, button);
    } else {
        console.warn(`[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.responses = new Collection();

const responsesPath = path.join(__dirname, 'responses');
const responseFiles = fs.readdirSync(responsesPath).filter(file => file.endsWith('.js'));
for (const file of responseFiles) {
    const response = require(path.join(responsesPath, file));
    if ('data' in response && 'execute' in response) {
        client.responses.set(response.data.name, response);
    } else {
        console.warn(`[WARNING] The response at ${file} is missing a required "customId" or "execute" property.`);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    startScheduler(client);
    console.log('Scheduler started.');
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
            await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
        }
    } else if (interaction.isButton()) {
        const [commandName, ...args] = interaction.customId.split('_');
        const button = client.buttons.get(commandName);

        if (!button) {
            console.error(`No button matching ${commandName} was found.`);
            return;
        }

        try {
            await button.execute(interaction, args);
        } catch (error) {
            console.error(`Error executing button ${commandName}`);
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
        }
    } else if (interaction.isModalSubmit()) {
        const [responseName, ...args] = interaction.customId.split('_');
        const response = client.responses.get(responseName);

        if (!response) {
            console.error(`No response matching ${responseName} was found.`);
            return;
        }

        try {
            await response.execute(interaction, args);
        } catch (error) {
            console.error(`Error executing response ${responseName}`);
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this response!', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
