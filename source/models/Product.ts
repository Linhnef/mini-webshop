import { Schema, model, Document } from 'mongoose';

export interface ProductType extends Document {
    code: string;
    category: string;
    picture: string[];
    name: string;
    price: number;
    description: string;
    evaluate: Review[];
    rating: number;
    amount: number;
    updatedAt?: string;
}
export type Review = {
    description: string;
    rating: number;
    orderId: string;
};

export type product = {
    code: string;
    category: string;
    picture: string[];
    name: string;
    price: number;
    description: string;
    evaluate: Review[];
    rating: number;
    amount: number;
    updateAt?: string;
};

const ProductSchema = new Schema(
    {
        code: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        picture: {
            type: Array,
            default: []
        },
        name: {
            type: String,
            max: 500
        },
        price: {
            type: Number,
            default: 0
        },
        description: {
            type: String
        },
        evaluate: {
            type: Array,
            default: []
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        amount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

const Product = model<ProductType>('Product', ProductSchema);
export default Product;
