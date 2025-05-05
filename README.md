# 📚 Homework & Test Manager Bot

**A Discord bot designed to help classmates manage homework and test assignments efficiently.**

## 📝 Overview

This bot assists a single class by:

- Creating and managing homework and test assignments.
- Notifying users about upcoming events.
- Supporting multiple subjects within one class.

## 🚀 Features

- **/úkol**: Add a new homework assignment.
- **/test**: Add a new test.
- **/nadcházející**: List upcoming homeworks and tests.
- **/upozorneni**: Toggle notifications for upcoming events.
- **/ping**: Check the bot's latency.
- **/pomoc**: Display help information for commands.

## ⚙️ Installation

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A Discord account
- A Discord application with a bot token
- A Giphy API key

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/homework-bot.git
   cd homework-bot
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

    - Rename `.env-example` to `.env`.
    - Fill in the required values:

      ```env
      DISCORD_TOKEN=your_discord_bot_token
      GIPHY_API_KEY=your_giphy_api_key
      GUILD_ID=your_discord_server_id
      CLIENT_ID=your_bot_client_id
      HOMEWORK_CHANNEL_ID=channel_id_for_homeworks
      TEST_CHANNEL_ID=channel_id_for_tests
      NOTIFY_ROLE_ID=role_id_for_notifications
      NOTIFY_CHANNEL_ID=channel_id_for_notifications
      ```

4. **Initialize the SQLite database:**

   ```bash
   sqlite3 database.sqlite < example.sql
   ```

5. **Register slash commands:**

    - For development (single guild):

      ```bash
      node sync.js dev
      ```

    - For production (global):

      ```bash
      node sync.js
      ```

## 🛠️ Deployment

To deploy the bot:

1. **Start the bot:**

   ```bash
   node index.js
   ```

2. **Optional: Use a process manager for production:**

    - Install [PM2](https://pm2.keymetrics.io/):

      ```bash
      npm install -g pm2
      ```

    - Start the bot with PM2:

      ```bash
      pm2 start index.js --name "homework-bot"
      ```

    - Save the PM2 process list:

      ```bash
      pm2 save
      ```

    - Set PM2 to start on system boot:

      ```bash
      pm2 startup
      ```

## 📚 Usage

Once the bot is running and added to your Discord server:

- Use `/pomoc` to view all available commands.
- Use `/pomoc příkaz:název` to get detailed information about a specific command.

## 🤝 Contributing

This project is primarily intended for personal use by classmates. However, feel free to fork and modify it for your own needs. Pull requests are welcome but may only be accepted if they align with the project's goals.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
