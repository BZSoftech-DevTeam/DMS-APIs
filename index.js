const express = require('express');
const cors = require('cors');
const apiRouter = require('./router/api-router');
require('dotenv').config({ path: './config.env' });

const server = express();

server.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ limit: '50mb', extended: true }));

server.use('/auth/api/tool/', apiRouter);

server.get('/', (req, res) => {
    res.status(200).send('👋Welcome to QuickDoc.app Server');
});

const Port = 5050;
server.listen(Port, () => {
    console.log(`🖥️  =================== Server Initiated at Port# ${Port} =================== 🖥️`);
});
