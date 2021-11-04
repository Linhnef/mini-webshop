import dotenv from 'dotenv';
dotenv.config();

const SERVER_PORT = process.env.SERVERPORT || 5000;
const SERVER_HOSTNAME = process.env.HOSTNAME || 'Localhost';

const SERVER = {
    hostname : SERVER_HOSTNAME,
    port : SERVER_PORT
};

const config = {
    server : SERVER
};

export default config;