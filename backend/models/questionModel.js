import mongoose from 'mongoose';

let questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    desc:{
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    }
})