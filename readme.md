# Pterodactyl Discord Bot

## Table des matières

1. [Description](#Description)
2. [Configuration](#Configuration)
3. [Start](#Start)
4. [Links](#Links)

---
## Description

This Discord bot allows you to perform actions regarding the Pterodactyl panel:

- Server
    - Create a server
    - Delete a server
    - View existing servers
    - View server information
    - Suspend a server
    - Unsuspend a server


- User
    - Create a user
    - Delete a user
    - View existing users
    - View a user's information
    - Link a pterodactyl user to a Discord user
    - Unlink a pterodactyl user to a Discord user

Additionally, you can monitor the status of bots:
- Monitoring
    - Added a bot to monitor
    - Removed a bot to monitor
    - View monitored bots

---
### Configuration
File `.env` : rename the file `.env.example` to `.env`

- `TOKEN`: Bot token
- `DEPLOY_SLASH`: Allows you to deploy slash commands

Example : `DEPLOY_SLASH=false` ou `DEPLOY_SLASH=true`

---
File `config.json`

Please complete the various fields.
````json
{
    "serverIdDeploySlash": "Id of the server where the slash commands will be deployed",
    "database": {
        "client": "mysql",
        "connection": {
            "host": "Host of the database",
            "port": "3306",
            "user": "User of the database",
            "password": "Password of the database",
            "database": "Name of the database",
            "charset": "utf8mb4"
        },
        "pool": {
            "min": 0,
            "max": 7
        }
    },
    "monitoringBot": {
        "channelId": "Channel where the bot will send the monitoring messages of the status of the bot",
        "roleId": "Role to ping when the bot is down"
    },
    "pterodactyl": {
        "ip": "Ip of the panel where it is hosted",
        "url": "URL of the panel : https://panel.xxx.com",
        "apiKeyApp": "App API key on pterodactyl : ptla_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "apiKeyClient": "Client API key on pterodactyl : ptlc_XXXXXXXXXXXXXXXXXXXXXXXX",
        "host": "SFTP of the pterodactyl : sftp://xxx.com:2022",
        "port": "Port of the pterodactyl : 2022",
        "nodeId": 1,
        "_commentNode": "Node Id of the pterodactyl",
        "nestId": 5,
        "_commentNest": "Nest Id of the pterodactyl where the eggs are",
        "eggJavascriptId": "Id of the egg for the javascript server",
        "eggJavaId": "Id of the egg for the java server",
        "eggPythonId": "Id of the egg for the python server"
    }
}
````
___
### Start

- Do `npm install` to install all dependencies required
- Start the bot : `node main.js`

---
### Links
[Discord server](https://discord.gg/Dwn5Nc6WgR) : If you have any questions, don't hesitate to join the discord server.

[BotMarket Website](https://botmarket.ovh) : Our website where you can find all our bots.