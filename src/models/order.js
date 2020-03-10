const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    product_name: {
        default:"chai",
        type: String,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    price:{
        type:Number,
        trim:true,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order