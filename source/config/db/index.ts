import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

async function connect() {
    try {
        const connectString = process.env.DB_URL ? process.env.DB_URL : '';
        await mongoose.connect(connectString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        await mongoose.set('useFindAndModify', false);
        console.log('connect successfully !!!');
    } catch (erorr) {
        throw 'Connect failure !!!';
    }
}

export default { connect, mongoose };
