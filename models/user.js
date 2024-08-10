const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	name: {
		type: String,
	},
	email: {
		type: String,
		unique: true,
	},
	googleImg: String,
	gooleAccessToken: String,
	googleId: String,
	password: String,
	role: { type: String, default: "user" },
	cart: [
		{
			id: {
				type: Schema.Types.ObjectId,
				required: true,
				ref: "products",
			},
			quantity: Number,
		},
	],
	address: {
		house: String,
		street: String,
		city: String,
		zipcode: String,
		phone: String,
	},
	orders: [
		{
			products: [],
			totalPrice: Number,
			date: {
				type: Date,
				default: Date.now,
			}
		}
	]
});

module.exports = mongoose.model('user',  userSchema);

let users = [
    {
        "name": "John Doe",
        "email": "john@gmail.com",
        "password": "123456789",
        "cart": []
    },
        {
        "name": "Dave Wells",
        "email": "dave@gmail.com",
        "password": "123456789",
        "cart": []
    },
    {
        "name": "Salman",
        "email": "salman@gmail.com",
        "password": "123456789",
        "cart": []
    }
]