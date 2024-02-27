const { Collection, PermissionsBitField, REST, Routes } = require("discord.js");
const fsJetpack = require('fs-jetpack');
const path = require('path');
const chalk = require('chalk');

const BASE_COLOR = "\x1b[";
const RESET = BASE_COLOR + "0m";

module.exports = class SlashCommandsHandler {
    constructor(client) {
        this.client = client
        this.utils = client.functions;
        this.slashCommands = new Collection()
    }

    getSlashCommand (command) {
        return this.slashCommands.get(command);
    }
    
    slash (command) {
        command.user_permissions.forEach((p, i) => {
            command.user_permissions[i] = PermissionsBitField.Flags[p];
        });
        const bit = command.user_permissions.reduce((a, b) => a | b, 0n).toString();
        return {
            name: command.name,
            name_localizations: command.name_localizations,
            description: command.description,
            description_localizations: command.description_localizations,
            type: command.type,
            dm_permission: command.dm_permission,
            default_member_permissions: bit !== "0" ? bit : null,
            options: command.options,
        }
    }

    async createSlashCommand (arrayOfSlashCommands) {
        const guild = this.client.guilds.cache.get(this.client.config["serverIdDeploySlash"]);
        if (!guild) return console.log(chalk.red(`Impossible de trouver le serveur ${this.client.config["serverIdDeploySlash"]} !`));

        const rest = new REST({ version: '10' }).setToken(process.env.DEV_TOKEN);

        await (async () => {
            try {
                console.log(chalk.yellow.bold('Début implémentation des commandes slashs du serveur !'));

                await rest.put(
                    Routes.applicationGuildCommands(this.client.user.id, guild.id),
                    { body: arrayOfSlashCommands }
                );

                console.log(chalk.yellow.bold('Toutes les commandes slashs du serveur sont prêtes !'));
                console.log(chalk.gray("—————————————————————————————————"));
            } catch (error) {
                this.client.logger.error(error);
            }
        })();
    }

    async loadSlashCommands() {
        const files = await fsJetpack.findAsync(
            path.join(__dirname, '../../slashCommands'),
            { matching: '*.js', directories: false, files: true, ignoreCase: true, recursive: true }
        );

        if (files.length <= 0) return this.client.logger.error('Aucune slash commande trouvée !');
        this.client.logger.log(`${files.length} ${files.length>1?'slash commandes ont été chargées':'slash commande a été chargée'} !`);

        const arrayOfSlashCommands = [];

        for (const file of files) {
            let description = null;
            let changeDescription = false;
            
            try {
                const filePath = path.join(process.cwd(), file);
                const fileClass = require(filePath);
                const fileInstance = new fileClass(this);
                
                if (fileInstance.disableSlash) continue;
                
                //ContextMenu
                if (fileInstance.type === 2 || fileInstance.type === 3) {
                    description = fileInstance.description
                    fileInstance.description = null;
                    changeDescription = true;
                }

                arrayOfSlashCommands.push(this.slash(fileInstance));
                
                if (changeDescription) fileInstance.description = description
                this.slashCommands.set(fileInstance.name, fileInstance);
            }
            catch (e) {
                this.client.logger.error(`Erreur de chargement de la commande slash ${file}: ${e}`);
            }
        }
            this.client.once('ready', async () => {
                if (process.env.DEPLOY_SLASH === 'true') await this.createSlashCommand(arrayOfSlashCommands);

                const length = 40;
                const symbol = "║";

                console.log(`${BASE_COLOR + "32m"}
        ╔${"═".repeat(length-2)}╗
        ${this.utils.createPipedString(`-->  Nom du bot : ${this.client.user.displayName}`, length, symbol)} ${BASE_COLOR + "33m"}
        ╟${"─".repeat(length-2)}╢
        ${this.utils.createPipedString(`-->  Utilisateurs : ${this.utils.numberWithSpaces(this.client.guilds.cache.map((guild) => guild.memberCount).reduce((p, c) => p + c))}`, length, symbol)} ${BASE_COLOR + "34m"}
        ╟${"─".repeat(length-2)}╢
        ${this.utils.createPipedString(`-->  Serveurs : ${this.client.guilds.cache.size}`, length, symbol)} ${BASE_COLOR + "35m"}
        ╟${"─".repeat(length-2)}╢
        ${this.utils.createPipedString('-->  Statut : Prêt', length, symbol)} ${BASE_COLOR + "36m"}
        ╚${"═".repeat(length-2)}╝` + RESET);
            });
    }
}
