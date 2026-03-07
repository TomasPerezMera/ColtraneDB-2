import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const userCollection = 'users';

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        required: true
    },
    firstName: {
        type: String,
        required: [true, 'El nombre es obligatorio!'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'El apellido es obligatorio!'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio!'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Error - email con caracteres inválidos!'],
        // Ocultaremos contraseña y email en respuestas por seguridad de datos.
        select: false
    },
    age: {
        type: Number,
        required: [true, 'La edad es obligatoria!'],
        trim: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria!'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    }
}, {
    timestamps: true,
    versionKey: false
});

// Implementamos Paginate.
userSchema.plugin(mongoosePaginate);

// Middleware para auto-incrementar id al crear un producto.
userSchema.pre('save', async function(next) {
    if (this.isNew) {
        const lastUser = await this.constructor.findOne().sort({ id: -1 });
        this.id = lastUser ? lastUser.id + 1 : 1;
    }
    next();
});

const userModel = mongoose.model(userCollection, userSchema);
export default userModel;