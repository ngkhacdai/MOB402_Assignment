const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    img: {
        data: String,
        contentType: String,
    },
    id_user: {
        type: String,
        required: true
    },
    name_user: {
        type: String,
        required: true
    }
});
const product = new mongoose.model('product', productSchema);
module.exports = product;