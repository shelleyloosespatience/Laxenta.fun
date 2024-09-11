const {
    SlashCommandBuilder,
    PermissionsBitField,
    EmbedBuilder,
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("echo")
        .setDescription(
            "Repeats the input message and can optionally send as an embed",
        )
        .addStringOption((option) =>
            option
                .setName("message")
                .setDescription("The message to echo")
                .setRequired(true),
        )
        .addBooleanOption((option) =>
            option
                .setName("embed")
                .setDescription("Send as an embed")
                .setRequired(false),
        )
        .addStringOption((option) =>
            option
                .setName("title")
                .setDescription("Title of the embed (optional)"),
        )
        .addStringOption((option) =>
            option
                .setName("footer")
                .setDescription("Footer text of the embed (optional)"),
        )
        .addStringOption((option) =>
            option
                .setName("thumbnail")
                .setDescription(
                    "URL of the thumbnail image for the embed (optional)",
                ),
        ),

    async execute(interaction) {
        if (
            !interaction.member.permissions.has(
                PermissionsBitField.Flags.Administrator,
            )
        ) {
            return interaction.reply({
                content: "You do not have permission to use this command!",
                ephemeral: true,
            });
        }

        const message = interaction.options.getString("message");
        const sendAsEmbed = interaction.options.getBoolean("embed") || false;
        const title =
            interaction.options.getString("title") ||
            `${interaction.guild.name}`;
        const footer =
            interaction.options.getString("footer") ||
            "Choose Laxenta — where support meets innovation. 🌐✨";
        const thumbnail = interaction.options.getString("thumbnail");

        await interaction.deferReply({ ephemeral: true }); 

        let echoResponse;
        if (sendAsEmbed) {
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .setFooter({ text: footer })
                .setColor("#00FF00"); 

            if (thumbnail) {
                embed.setThumbnail(thumbnail);
            }

            echoResponse = { embeds: [embed] };
        } else {
            echoResponse = { content: message };
        }
        await interaction.channel.send(echoResponse);
        await interaction.deleteReply();
    },
};
