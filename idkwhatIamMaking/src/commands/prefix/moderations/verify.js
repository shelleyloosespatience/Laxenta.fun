const { handleVerifyCommand } = require('../../../utils/verification');

module.exports = {
name: 'verify',
description: 'Verify yourself to gain access to the server {!toggleverify to enable verification in server}',
async execute(message, args) {
await handleVerifyCommand(message);
},
};