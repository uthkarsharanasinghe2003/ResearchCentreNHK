import 'dotenv/config';
import express, { json } from 'express';
import mongoose, { connect } from 'mongoose';
import router from './routes/router';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middlewares/error';

const app = express();
const port = 3000;

app.use(cors({
    origin: ['http://localhost:5173', '*']
}));

mongoose.set('debug', true);
app.use(express.json({ limit: '5mb' }));
app.use(json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/v1', router);
app.use(errorHandler);

app.listen(port, () => {
    connect('mongodb://danika:elgATERSETEnTHaKetRuMica@144.91.100.83:27017/researchdb?authSource=researchdb&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false').then(() => {
        console.log(`Connected to DB`);
    });
    console.log(`Application is running on port ${port}.`);
});
