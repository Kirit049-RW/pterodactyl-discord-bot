const SlashCommand = require('../../../managers/structures/SlashCommands.js');
const generator = require('generate-password');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const axios = require('axios');

module.exports = class CreateUser extends SlashCommand {
    constructor(handler) {
        super(handler,{
            name: 'create-user',
            description: 'Create a new user on the pterodactyl panel',
            description_localizations: {
                "fr": "Créer un nouvel utilisateur sur le panel pterodactyl"
            },
            options: [{
                name: 'email',
                description: 'Email of the user to create',
                description_localizations: {
                    "fr": "Email de l'utilisateur à créer"
                },
                type: 3,
                required: true
            }, {
                name: 'username',
                description: 'Username of the user to create',
                description_localizations: {
                    "fr": "Pseudo de l'utilisateur à créer"
                },
                type: 3,
                required: true
            }, {
                name: 'discord',
                description: 'Discord user to link to the pterodactyl user',
                description_localizations: {
                    "fr": "Utilisateur discord à lier à l'utilisateur pterodactyl"
                },
                type: 6,
                required: true
            }],
            category: SlashCommand.Categories.UserPterodactyl,
            user_permissions: ['Administrator']
        });
    }

    async fetchImage(src) {
        const image = await axios
            .get(src, {
                responseType: 'arraybuffer'
            })
        return image.data;
    }

    async run (ctx) {
        const email = ctx.options.getString('email');
        const username = ctx.options.getString('username');
        const discord = ctx.options.getUser('discord');

        /* Check if user is valide because username must start and end with alpha-numeric characters and contain only letters, numbers, dashes, underscores, and periods. */
        if (!username.match(/^[a-zA-Z0-9][a-zA-Z0-9_-]+[a-zA-Z0-9]$/)) return ctx.error('Le pseudo doit commencer et se terminer par des caractères alphanumériques et ne contenir que des lettres, des chiffres, des tirets, des tirets du bas et des points !');

        /* Check if a user already exist with this email */
        const users =  await ctx.pterodactyl.app.getAllUsers().catch(() => null);

        for (const user of users) {
            if (user.attributes.email === email) return ctx.error('Un utilisateur pterodactyl avec cet email existe déjà !');
        }

        /* Check if this discord user is a bot */
        if (discord.bot) return ctx.error('Vous ne pouvez pas lier un bot !');

        /* Check if a user is already linked to this discord user */
        const userDiscord = await ctx.database.table('users').select().where('discordId', discord.id);
        if (userDiscord[0]) return ctx.error('Cet utilisateur discord est déjà attribué à un utilisateur pterodactyl !');

        /* Send a waiting message */
        await ctx.send({
            content: `:clock10: Création de l'utilisateur pterodactyl en cours...`
        });

        /* Generate a password */
        const password = generator.generate({
            length: 8,
            numbers: true,
            lowercase: true,
            uppercase: true,
            strict: true
        });

        /* Check if folder pdf exist */
        ctx.utils.createFolderIfNotExists('./pdf')

        /* Create PDF */
        const doc = new PDFDocument({
            size: 'A6',
            layout: 'landscape',
            info: {
                Title: 'Informations de connexion',
                Author: 'Pterodactyl Login',
            }
        });

        /* Check if file already exist */
        if (fs.existsSync(`./pdf/connexion_${discord.displayName}.pdf`)) {
            fs.unlinkSync(`./pdf/connexion_${discord.displayName}.pdf`)
        }

        /*Create stream */
        const stream = fs.createWriteStream(`./pdf/connexion_${discord.displayName}.pdf`);

        doc.pipe(stream)

        /* Title */
        doc.fontSize(20)
        doc.font('Helvetica-Bold')
        doc.text('Informations de connexion', {
            align: 'center',
            underline: true
        })

        /* Content */
        doc.moveDown(1)
        doc.fontSize(8)
        doc.font('Helvetica')
        doc.text('Lien du panel :         ', {
            align: 'center',
            continued: true
        })

        doc.fillColor('blue')
        doc.text(`cliquez ici`, {
            align: 'center',
            link: ctx.config["pterodactyl"]["url"],
            underline: true
        })

        doc.fillColor('black')
        doc.text(`Email : ${email}\nUsername : ${username}\nPassword : ${password}`, {
            align: 'center'
        })

        doc.moveDown(1)
        doc.fillColor('red')
        doc.font('Helvetica-Bold')
        doc.text('ATTENTION ! Veuillez changer votre mot de passe lors de votre 1ère connexion !', {
            underline: true,
            align: 'center'
        })

        /* Image */
        const logo = await this.fetchImage(ctx.me.user.displayAvatarURL({ extension: 'png' }));
        doc.moveDown(1)
        doc.image(logo, doc.page.width/2 - 50/2,doc.y, {
            width: 50
        })

        /* End */
        doc.end()

        stream.on('finish', async () => {
            /* Create the user */
            ctx.pterodactyl.app.createUser(username, username, username, email, password)
                .then(async (u) => {
                    await ctx.inter.editReply({
                        content: `${ctx.emojiSuccess} L'utilisateur pterodactyl (id : \`${u.id}\`) a été créé avec succès !`,
                        files: [{
                            attachment: `./pdf/connexion_${discord.displayName}.pdf`
                        }]
                    });

                    /* Link the user to the discord user */
                    await ctx.database.table('users').insert({
                        discordId: discord.id,
                        pterodactylId: u.id
                    });
                })
                .catch((e) => {
                    ctx.inter.editReply({
                        content: `${ctx.emojiError} Une erreur est survenue lors de la création de l'utilisateur pterodactyl !\n${e}`
                    });
                });
        });
    }
}
