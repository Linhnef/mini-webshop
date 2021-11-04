import { Schema, model, Document } from 'mongoose';

export interface OrderType extends Document {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    proucts: string[];
    totalAmount: number;
    createAt?: Date;
    Accept: boolean;
}

export type order = {
    name: string;
    address: string;
    phone: string;
    email: string;
    proucts: string[];
    totalAmount: number;
    createAt?: Date;
    Accept: boolean;
};

const OrderSchema = new Schema(
    {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            max: 11
        },
        price: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number
        },
        proucts: {
            type: Array,
            default: []
        },
        Accept: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Order = model<OrderType>('Order', OrderSchema);
export default Order;
