import userModel from '../models/user.model.js';

class UserService {

    async getAll(options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            return await userModel.paginate({}, { page, limit });
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    async getById(userId) {
        try {
            // Validamos que ID sea numérico.
            if (!Number.isInteger(Number(userId))) {
                throw new Error('ID de usuario inválido');
            }
            const user = await userModel.findOne({ id: userId });
            if (!user) throw new Error('Usuario no encontrado');
            return user;
        } catch (error) {
            throw new Error(`Error obteniendo usuario: ${error.message}`);
        }
    }

    async create(userData) {
        try {
            const newUser = await userModel.create(userData);
            return newUser;
        } catch (error) {
            throw new Error(`Error creando usuario: ${error.message}`);
        }
    }

    async update(userId, updateData) {
        try {
            if (!Number.isInteger(Number(userId))) {
                throw new Error('ID de usuario inválido');
            }
            const updatedUser = await userModel.findOneAndUpdate({ id: userId }, updateData, { returnDocument: 'after', runValidators: true });
            if (!updatedUser) throw new Error('Usuario no encontrado');
            return updatedUser;
        } catch (error) {
            throw new Error(`Error actualizando usuario: ${error.message}`);
        }
    }

    async delete(userId) {
        try {
            if (!Number.isInteger(Number(userId))) {
                throw new Error('ID de usuario inválido');
            }
            const deletedUser = await userModel.deleteOne({ id: userId });
            if (deletedUser.deletedCount === 0) {
                throw new Error('Usuario no encontrado');
            }
            return deletedUser;
        } catch (error) {
            throw new Error(`Error eliminando usuario: ${error.message}`);
        }
    }
}

export default new UserService();