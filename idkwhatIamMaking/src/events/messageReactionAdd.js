const { handleReactionAdd } = require("../utils/verification");

module.exports = async (client, reaction, user) => {
    await handleReactionAdd(reaction, user);
};
