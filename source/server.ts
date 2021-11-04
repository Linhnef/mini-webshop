import http from 'http';
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import logging from './config/logging';
import config from './config/congfig';
import db from './config/db';
import Product, { product } from './models/Product';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import Order, { order } from './models/Order';
import { Review } from './models/Review';
import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

const NAMESPACE = 'server';
const router = express();
dotenv.config({ path: '.env' });

const sendEmail = async (email: string, text: string) => {
    let testAccount = await nodemailer.createTestAccount();
    var transporter = nodemailer.createTransport({
        // config mail server
        service: 'Gmail',
        auth: {
            user: 'begin270519@gmail.com',
            pass: '010101Qa'
        }
    });

    var mainOptions = {
        from: 'Thanh Batmon',
        to: email,
        subject: 'Test Nodemailer',
        text: 'You recieved message from ',
        html: `
        <h1>Hi begin270519@gmail.com this email from ZUCI</h1>
        <p>${text}</p>
        <hr />
        <h4>Contact us</h4>
        <h5>Phone : 035834810</h5>
        <h5>Email : begin270519@gmail.com</h5>
        <h5>Facebook : https://facebook.com/ThuLa</h5>
        <hr />
        `
    };
    transporter.sendMail(mainOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
};

db.connect();

type updateProduct = {
    amount?: number;
    price?: number;
};
type AddProduct = {
    code: string;
    category: string;
    name: string;
    price: number;
    description: string;
    amount: number;
    picture?: string[];
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, './image'));
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, 'Photo' + Date.now() + '-' + fileName);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

router.use('/image', express.static('source/image'));
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors());

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

router
    .delete('/product/:code/evaluate/:id', async (req: Request, res: Response) => {
        const code = req.params.code;
        const id = req.params.id;
        try {
            if (code && id) {
                const tmp = await Product.findOne({ code: code });
                if (tmp) {
                    await tmp.update({ $pull: { evaluate: { id: id } } }, { multi: true });

                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false });
                }
            } else {
            }
        } catch (error) {
            res.status(500).json({ success: false });
        }
    })
    .post('/order/add', async (req: Request, res: Response) => {
        try {
            const data: order = req.body;
            const orderId = 'order_' + Date.now();
            const newItem = new Order({
                id: orderId,
                ...data
            });
            newItem.save();
            sendEmail(data.email, `Your just create a orthe with ID : ${orderId}, includes : ${data.proucts}. please keep an eye on the shipper's phone in the next 2-3 days`);
            res.status(200).json({ success: true });
        } catch (error) {
            res.status(500).json({ success: false });
        }
    })
    .get('/order/all', async (req: Request, res: Response) => {
        try {
            const data = await Order.find();
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ success: false });
        }
    })
    .delete('/order/delete/:id', async (req: Request, res: Response) => {
        const id = req.params.id;
        try {
            if (id) {
                await Order.deleteOne({ id: id });
                res.status(200).json({ success: true });
            } else {
                res.status(500).json({ success: false });
            }
        } catch (error) {
            res.status(500).json({ success: false });
        }
    })
    .put('/order/accept/:id', async (req: Request, res: Response) => {
        try {
            const accept = req.body.accept;
            const id = req.params.id;
            console.log(accept);
            const element = await Order.findOne({ id: id });
            if (element) {
                await element.updateOne({ Accept: accept });
                res.status(200).json({ success: true });
            } else {
                res.status(500).json({ success: false });
            }
        } catch (error) {
            res.status(500).json({ success: false });
        }
    })
    .put('/product/review/:code', async (req: Request, res: Response) => {
        const code = req.params.code;
        const body: { evaluate: Review } = {
            evaluate: req.body.evaluate
        };

        try {
            if (code) {
                const tmp = await Product.findOne({ code: code });
                let rating = 0;
                if (tmp && body.evaluate) {
                    rating = (tmp.evaluate.length * tmp.rating + body.evaluate.rating) / (tmp.evaluate.length + 1);
                    rating = rating !== 0 ? rating : tmp.rating;
                    await tmp.updateOne({
                        $push: { evaluate: body.evaluate },
                        rating: rating
                    });
                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false });
                }
            } else {
                res.status(500).json({ success: false });
            }
        } catch (error) {
            res.status(500).json({ success: false });
        }
    })
    .put('/product/update/:code', async (req: Request, res: Response) => {
        const code = req.params.code;
        const body: updateProduct = {
            amount: req.body.amount,
            price: req.body.price
        };

        try {
            if (code) {
                const tmp = await Product.findOne({ code: code });
                if (tmp) {
                    await tmp.updateOne({
                        amount: body.amount,
                        price: body.price
                    });
                    res.status(200).json({ success: true });
                } else {
                    res.status(500).json({ success: false });
                }
            } else {
                res.status(500).json({ success: false });
            }
        } catch (error) {
            res.status(500).json({ success: false });
        }
    })
    .post('/product/add' /* , upload.array('imgs', 4) */, async (req: Request, res: Response) => {
        try {
            const code = req.body.name
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .split(' ')
                .join('');
            const pictures: string[] = [];
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            console.log(files);
            /* const data = Object.assign(files) as { filename: string }[];
            data.map((item) => pictures.push(req.protocol + '://' + req.get('host') + '/image/' + item.filename));

            const product: AddProduct = {
                code: code,
                name: req.body.name,
                category: req.body.category,
                amount: parseInt(req.body.amount),
                description: req.body.description,
                price: parseInt(req.body.price),
                picture: pictures
            };
            const newItem = new Product(product);
            await newItem.save();
            res.status(200).json({ success: true }); */
        } catch (error) {
            console.log(error);
            res.status(500).json({ success: false });
        }
    })
    .delete('/product/delete/:code', async (req: Request, res: Response) => {
        const code = req.params.code;
        console.log('in');
        try {
            if (code) {
                await Product.deleteOne({ code: code });
                console.log('ok');
                res.status(200).json({ success: true });
            } else {
                res.status(500).json({ success: false });
            }
        } catch (error) {
            res.status(500).json({ success: false });
        }
    })
    .get('/products', async (req: Request, res: Response) => {
        try {
            if (req.query.limit && req.query.page && typeof req.query.limit === 'string' && typeof req.query.page === 'string') {
                const perPage = parseInt(req.query.limit);
                const page = Math.max(0, parseInt(req.query.page) - 1);
                const products = await Product.find()
                    .limit(perPage)
                    .skip(perPage * page)
                    .sort({
                        name: 'asc'
                    });
                res.status(200).json(products);
            } else {
                res.status(500).json({ message: 'invalid value' });
            }
        } catch (error) {
            res.status(500).json(error);
        }
    })
    .get('/products/arrival', async (req: Request, res: Response) => {
        try {
            const products = await Product.find({});
            products.sort((a, b) => {
                if (a.updatedAt && b.updatedAt) {
                    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
                }
                return 0;
            });
            res.status(200).json(products.filter((item, index) => index < 6));
        } catch (error) {
            res.status(500).json(error);
        }
    })
    .get('/product/:category', async (req: Request, res: Response) => {
        try {
            const products = await Product.find({ category: req.params.category });
            products.sort((a, b) => {
                if (a.updatedAt && b.updatedAt) {
                    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
                }
                return 0;
            });
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json(error);
        }
    });

const host = process.env.HOST || '0.0.0.0';
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;
router.listen(port, host, () => {
    console.log(`Server listen on port ${port} !!!`);
});
