const { EmbedBuilder } = require('discord.js');
const db = require('../database.js');
require('dotenv').config();

const NOTIFY_ROLE_ID = process.env.NOTIFY_ROLE_ID;
const NOTIFY_CHANNEL_ID = process.env.NOTIFY_CHANNEL_ID;

function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}.${date.getFullYear()}`;
}

async function fetchDueItems() {
    const sql = `
        SELECT subject, topic, description, due_date, 'homework' AS type
        FROM homework
        WHERE due_date BETWEEN datetime('now') AND datetime('now', '+2 days')
        UNION ALL
        SELECT subject, topic, description, due_date, 'test' AS type
        FROM test
        WHERE due_date BETWEEN datetime('now') AND datetime('now', '+2 days')
        ORDER BY due_date ASC
    `;
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function sendNotifications(client) {
    const items = await fetchDueItems();
    if (!items || items.length === 0) return;

    const channel = await client.channels.fetch(NOTIFY_CHANNEL_ID);
    if (!channel) {
        console.error('Notification channel not found.');
        return;
    }

    const homeworks = items.filter((item) => item.type === 'homework');
    const tests = items.filter((item) => item.type === 'test');

    const embeds = [];

    if (homeworks.length > 0) {
        const homeworkEmbed = new EmbedBuilder()
            .setTitle('📚 Nadcházející domácí úkoly')
            .setColor(0x2ecc71)
            .setFooter({ text: 'Školní plánovač' });

        homeworks.forEach((hw) => {
            homeworkEmbed.addFields({
                name: `📘 ${hw.subject} – ${hw.topic}`,
                value: `📝 ${hw.description}\n📅 Termín: **${formatDate(hw.due_date)}**`,
                inline: false,
            });
        });

        embeds.push(homeworkEmbed);
    }

    if (tests.length > 0) {
        const testEmbed = new EmbedBuilder()
            .setTitle('🧪 Nadcházející testy')
            .setColor(0xe67e22)
            .setFooter({ text: 'Školní plánovač' });

        tests.forEach((test) => {
            testEmbed.addFields({
                name: `📘 ${test.subject} – ${test.topic}`,
                value: `📝 ${test.description}\n📅 Termín: **${formatDate(test.due_date)}**`,
                inline: false,
            });
        });

        embeds.push(testEmbed);
    }

    await channel.send({ content: `<@&${NOTIFY_ROLE_ID}>`, embeds });
}

function startScheduler(client) {
    // For debugging: check every minute
    setInterval(() => {
        sendNotifications(client).catch(console.error);
    }, 60 * 1000);

    // For production: check at midnight
    // const schedule = require('node-schedule');
    // schedule.scheduleJob('0 0 * * *', () => {
    //     sendNotifications(client).catch(console.error);
    // });
}

module.exports = { startScheduler };
