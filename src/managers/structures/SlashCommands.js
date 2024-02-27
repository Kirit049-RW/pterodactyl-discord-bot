module.exports = class SlashCommand {
    constructor(handler, opts = {}) {
        this.handler = handler;

        this.name = (opts.name || '');
        this.name_localizations = (opts.name_localizations || {});
        this.description = (opts.description || {});
        this.description_localizations = (opts.description_localizations || {});
        this.type = (opts.type || null);
        this.dm_permission = (opts.dm_permission || false);
        this.options = (opts.options || []);

        this.disableSlash = (opts.disableSlash || false);
        
        this.category = (opts.category || SlashCommand.Categories.Divers);
        this.user_permissions = (opts.user_permissions || []);
        this.bot_permissions = (opts.bot_permissions || []);
    }

    static get Categories () {
        return {
            Divers : {
                id: 1,
                name : {
                    "fr" : "Divers",
                    "en-GB" : "Misc"
                },
                emoji: "⭐"
            },
            ServerPterodactyl : {
                id: 2,
                name : {
                    "fr" : "Serveur Pterodactyl",
                    "en-GB" : "Pterodactyl Server"
                },
                emoji: "📡"
            },
            UserPterodactyl : {
                id: 3,
                name : {
                    "fr" : "Utilisateur Pterodactyl",
                    "en-GB" : "Pterodactyl User"
                },
                emoji: "👤"
            },
            Admin : {
                id: 4,
                name : {
                    "fr" : "Administrateur",
                    "en-GB" : "Administrator"
                },
                emoji: "🔒"
            }
        }
    }

    get client () {
        return this.handler.client
    }

    get config () {
        return this.client.config
    }
}
