import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

export async function hashPassword(plainTextPassword) {
  return await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

export async function comparePassword(plainTextPassword, hashedPassword) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}

export default { hashPassword, comparePassword };
