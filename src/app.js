import 'dotenv/config';
import express from 'express';
import __dirname from './utils.js';
import handlebars from 'express-handlebars';
import {Server} from 'socket.io';
import mongoose from 'mongoose';
import userRouter from './routes/user.router.js';
import productRouter from './routes/product.router.js';
import cartRouter from './routes/cart.router.js';
import viewsRouter from './routes/views.router.js';
import usersViewRouter from './routes/users.views.router.js';
import { initializeSocket } from './sockets/socket.handler.js';


const app = express();

// 1. Configuración del motor de plantillas Handlebars.
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');


// 2. Configuración de middlewares.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


// 3. Configuración de rutas.
app.use('/', viewsRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/views/users', usersViewRouter);


// 4. Conexión a MongoDB.
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Conexión con éxito a MongoDB!');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        process.exit(1);
    }
};
connectMongoDB();


// 5. Configuración del servidor HTTP.
const httpServer = app.listen(process.env.PORT, () => console.log('Escuchando en Puerto: ' + process.env.PORT));


// 6. Configuración de Socket.io.
const io = new Server(httpServer);
initializeSocket(io);
app.set('io', io);