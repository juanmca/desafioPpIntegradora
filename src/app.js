import express from 'express';
import mongoose from 'mongoose'
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import ProductManager from './dao/models/products.model.js';
import messageModel from './dao/models/messages.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = 8080;
import productsRouter from './routes/products-router.js';
import cartRouter from './routes/carts-router.js';
import homeRouter from './routes/home-router.js';
import chatRouter from './routes/chat-router.js';
import realTimeProductRouter from './routes/realTimeProduct-router.js';

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartRouter);
app.use('/', homeRouter);
app.use('/chat', chatRouter);
app.use('/realtimeproducts', realTimeProductRouter);

app.use((req, res) => {
    res.status(404).json({ message: 'Página no encontrada' });
});

const server = app.listen(port, () => {
    console.log(`Servidor encendido y escuchando el puerto ${port}`);
});

// Conexión MongoDB
try {
    await mongoose.connect('', { dbName: 'ecommerce' })
    console.log('DataBase Online!')
} catch (error) {
    console.log(error.message)
}

// Conexión Socket.io/Chat
const io = new Server(server);
app.set('io', io);

io.on('connection', async (socket) => {
    console.log('Un usuario se ha conectado');

    socket.on('setUserName', (userInfo) => {
        socket.userName = userInfo.userName;
        socket.userEmail = userInfo.userEmail;
        io.emit('userConnected', socket.userName);
    });

    try {
        const productManager = new ProductManager();
        const productos = await productManager.getProducts();
        socket.emit('productos', productos);

        const chatHistory = await messageModel.find().sort({ timestamp: 1 });
        socket.emit('chatHistory', chatHistory);
    } catch (error) {
        console.error('Error al obtener productos o historial de chat:', error.message);
    }

    socket.on('sendMessage', async (message) => {
        const newMessage = new messageModel({
            user: socket.userEmail,
            message,
        });

        try {
            await newMessage.save();
            io.emit('chatMessage', { userName: socket.userName, message });
        } catch (error) {
            console.error('Error al guardar el mensaje:', error.message);
        }
    });

    socket.on('disconnect', () => {
        if (socket.userName) {
            io.emit('userDisconnected', socket.userName);
            console.log(`${socket.userName} se ha desconectado`);
        }
    });
});