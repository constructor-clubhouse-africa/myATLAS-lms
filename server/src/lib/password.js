const bycrypt = require('bcrypt');
const SALT_ROUNDS = 12;

async function hashPassword(plainTextPassword) {
    return await bycrypt.hash(plainTextPassword, SALT_ROUNDS);
}

async function comparePassword(plainTextPassword, hashedPassword) {
    return await bycrypt.compare(plainTextPassword, hashedPassword);
}

module.exports = { hashPassword, comparePassword };