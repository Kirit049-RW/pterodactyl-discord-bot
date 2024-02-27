const SlashCommand = require('../../../managers/structures/SlashCommands.js');
const ms = require('ms');
const schedule = require('node-schedule');
const config = require('../../../../config.json');

module.exports = class CreateServer extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'create-server',
            description: 'Create a new server on the pterodactyl panel',
            description_localizations: {
                "fr": "Créer un nouveau serveur sur le panel pterodactyl"
            },
            options: [{
                name: 'name',
                description: 'Name of the server to create',
                description_localizations: {
                    "fr": "Nom du serveur à créer"
                },
                type: 3,
                required: true
            }, {
                name: 'owner',
                description: 'Pterodactyl Id of the user to link to the pterodactyl panel',
                description_localizations: {
                    "fr": "Id pterodactyl de l'utilisateur à lier au panel pterodactyl"
                },
                type: 4,
                required: true,
                min_value: 1
            }, {
                name: 'library',
                description: 'Library of the server to create',
                description_localizations: {
                    "fr": "Librairie du serveur à créer"
                },
                type: 4,
                required: true,
                choices: [{
                    name: 'Javascript',
                    value: config["pterodactyl"]["eggJavascriptId"]
                }, {
                    name: 'Java',
                    value: config["pterodactyl"]["eggJavaId"]
                }, {
                    name: 'Python',
                    value: config["pterodactyl"]["eggPythonId"]
                }]
            }, {
                name: 'database',
                description: 'Is the server need a mysql database ?',
                description_localizations: {
                    "fr": "Le serveur a-t-il besoin d'une base de données mysql ?"
                },
                type: 5,
                required: true
            }, {
                name: 'backup',
                description: 'Is the server need a backup ?',
                description_localizations: {
                    "fr": "Le serveur a-t-il besoin d'une sauvegarde ?"
                },
                type: 5,
                required: true
            }, {
                name: 'time',
                name_localizations: {
                    "fr": "temps",
                },
                description: 'Time to suspend the server in day',
                description_localizations: {
                    "fr": "Temps à suspendre le serveur en jour",
                },
                type: 3,
                required: false
            }],
            category: SlashCommand.Categories.ServerPterodactyl,
            user_permissions: ['Administrator']
        });
    }

    async run (ctx) {
        const name = ctx.options.getString('name');
        const owner = ctx.options.getInteger('owner');
        const database = ctx.options.getBoolean('database');
        const backup = ctx.options.getBoolean('backup');
        const library = ctx.options.getInteger('library');
        const time = ctx.options.getString('time') || null;

        /* Check if the time contain the letter d */
        if (time && !time.includes('d')) return ctx.error('Le temps doit être en jour !');

        /* Check if the time is correct */
        if (time && !ms(time)) return ctx.error('Le temps est incorrect !');

        /* Check if this pterodactyl user exist */
        const userPterodactylExist = await ctx.pterodactyl.app.getUserInfo(owner).catch(() => null);
        if (!userPterodactylExist) return ctx.error('Cet utilisateur pterodactyl n\'existe pas !');

        /* Get the discord user */
        let userDiscord = await ctx.database.table('users').select().where('pterodactylId', owner);
        userDiscord = userDiscord[0] ? ` pour ${ctx.getMember(userDiscord[0].discordId) ? `${ctx.getMember(userDiscord[0].discordId).user.displayName} ` : ''}(${userDiscord[0].discordId})` : '';

        /* Send a waiting message */
        await ctx.send({
            content: `:clock10: Création du serveur en cours...`,
        });

        /* Get all allocations */
        let allocations = await ctx.pterodactyl.app.getAllAllocations(ctx.config['pterodactyl']['nodeId']).catch(() => null);
        let freeAllocation = null;

        /* Check if there is allocations */
        if (allocations[0]) {
            /* Remove all allocations that are not free */
            const allocationsFiltered = allocations.filter((a) => a.attributes.assigned === false);

            /* Get the first free allocation */
            if (allocationsFiltered[0]) freeAllocation = allocationsFiltered[0].attributes.id;
        }

        /* Create an allocation if there is no free allocation */
        if (!freeAllocation) {
            /* Get the biggest port */
            let biggestPort = allocations.sort((a, b) => b.attributes.port - a.attributes.port)[0].attributes.port;
            biggestPort++;

            /* Create the allocation */
            const allocation = await ctx.pterodactyl.app.createAllocation(ctx.config['pterodactyl']['nodeId'],
                [`${biggestPort}`],
                '',
                `${ctx.config["pterodactyl"]["ip"]}`
            );

            if (allocation !== 'Successfully created!') return ctx.inter.editReply({
                content: `${ctx.emojiError} Une erreur est survenue lors de la création de l\'allocation !`
            });

            /* Updated all allocations */
            allocations = await ctx.pterodactyl.app.getAllAllocations(ctx.config['pterodactyl']['nodeId']).catch(() => null);

            /* Remove all allocations that are not free */
            const allocationsFiltered = allocations.filter((a) => a.attributes.assigned === false);

            /* Get the first free allocation */
            freeAllocation = allocationsFiltered[0].attributes.id;
        }

        ctx.pterodactyl.app.createServer(
            `${name}`, /* The name of the server */
            owner, /* The owner of the server */
            `Hébergement d\'un bot Discord${userDiscord}.`, /* The description of the server */
            ctx.config['pterodactyl']['nestId'], /* The nest id of the server (Bot) */
            library, /* The egg id of the server */
            freeAllocation, /* The default allocation id of the server */
            [], /* Additional allocation ids of the server */
            {}, /* Environment variables of the server */
            30, /* CPU limit of the server */
            250, /* RAM limit of the server */
            250, /* DISK limit of the server */
            database === true ? 1 : 0, /* Database limit of the server */
            0, /* Allocation limit of the server */
            backup === true ? 1 : 0, /* Backup limit of the server */
            ``, /* The startup command of the server */
            ``, /* The docker image of the server */
            0, /* The swap limit of the server */
            500, /* The io limit of the server */
            false, /* Is the server start on creation ? */
            {} /* Additional information */
        )
            .then(async (s) => {
                await ctx.inter.editReply({
                    content: `${ctx.emojiSuccess} Le serveur (id : \`${s.id}\`) a bien été créé avec succès !\nLien : ${ctx.config['pterodactyl']['url']}/server/${s.identifier}`
                });

                if (time) {
                    const timing = Date.now() + ms(time);

                    /* Add to database */
                    await ctx.database.table('schedule_servers').insert({
                        serverId: s.id,
                        time: timing
                    });

                    schedule.scheduleJob(`${s.id}`, timing, async () => {
                        /* Suspend the server */
                        ctx.pterodactyl.app.suspendServer(s.id)
                            .then(async () => {
                                ctx.client.logger.warn(`Schedule Suspend Server : ${s.name} (${s.id})`);

                                /* Delete from database */
                                await ctx.database.table('schedule_servers').delete().where('serverId', s.id);
                            })
                            .catch((e) => {
                                ctx.client.logger.error(`Schedule Create Server Error : ${e}`);
                            });
                    });
                }
            })
            .catch((e) => {
                ctx.inter.editReply({
                    content: `${ctx.emojiError} Une erreur est survenue lors de la création du serveur !\n${e}`
                });
            });
    }
}
