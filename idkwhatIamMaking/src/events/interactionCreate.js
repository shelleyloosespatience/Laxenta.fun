const logger = require('../utils/logger');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (interaction.isCommand()) {
                await handleCommandInteraction(interaction, client);
            } else if (interaction.isButton()) {
                await handleButtonInteraction(interaction, client);
            } else {
                logger.warn(`Unhandled interaction type.`);
            }
        } catch (error) {
            logger.error(`Error handling interaction: ${error}`);
            // Reply to the interaction if it hasn't been replied to
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "There was an error handling your request.", ephemeral: true }).catch(console.error);
            }
        }
    },
};

async function handleCommandInteraction(interaction, client) {
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) {
        return logger.warn(`Command ${interaction.commandName} not found.`);
    }
    try {
        await command.execute(interaction, client);
    } catch (error) {
        logger.error(`Error executing command: ${error.message}`);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: `There was an error executing the command.\n${error.message}`, ephemeral: true }).catch(console.error);
        }
    }
}

async function handleButtonInteraction(interaction, client) {
    // You can lookup button handlers here if they are dynamically registered
    // Otherwise, you can handle them within the command file's execute method
    logger.info(`Button ${interaction.customId} clicked by ${interaction.user.tag}`);
}