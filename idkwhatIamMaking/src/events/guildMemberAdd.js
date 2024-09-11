const { handleGuildMemberAdd } = require('../utils/verification');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member) {
        await handleGuildMemberAdd(member);
    },
};