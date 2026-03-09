import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import bcrypt from 'bcrypt';

// Utility para crear hash de contraseña.
export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

// Utility para validar contraseñas.
export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

export default __dirname;