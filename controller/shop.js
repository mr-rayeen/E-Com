const Products = require('../models/products');
const user = require('../models/user');
const Users = require('../models/user');

module.exports.getProductsAll = async (req, res, next)=>{
    try {
        let product = await Products.find({});
        const { getProductCategoryWise } = require('../utils/library');

        let categoryProducts = getProductCategoryWise(products);

    }
    catch (err) {
        next(err);
    }
}

module.exports.getHome = async (req, res, next) => {
  if (req.user == undefined) {
		isAdmin = false;
  } else if (req.user.role == "admin") {
		isAdmin = true;
  } else {
		isAdmin = false;
  }
  try {
    let products = await Products.find({});
    const { getProductCategoryWise } = require("../utils/library");

      let categoryProducts = getProductCategoryWise(products);
      res.render("shop/home", {
        products: categoryProducts,
        isAdmin,
        isLoggedIn: req.isAuthenticated(),
        user: req.user
      });
  } catch (err) {
    next(err);
  }
};

module.exports.getProductById = async (req, res, next) => {
  if (req.user.role == "admin") {
		isAdmin = true;
  } else {
		isAdmin = false;
  }
    const { id } = req.params;
    let product = await Products.findOne({ _id: id });
    res.render('shop/product-details', {
      product,
      isLoggedIn: req.isAuthenticated(),
      isAdmin,
      user: req.user
    })
}

module.exports.getProductAddById= async (req, res, next)=>{
 try {
        const { id } = req.params;
        let cart = req.user.cart;
        let indx = -1;
        cart.forEach((item, i) => {
            if (item.id == id) {
              indx = i;
            }
        })
        if (indx == -1) {
            cart.unshift({
                id: id,
                quantity: 1
            })
        }
        else {
            cart[indx].quantity++;
        }

        // To make sure that db mei changes ho jaaye we need to save it
        await req.user.save();
        res.redirect('/shop/cart');
    } catch (err) {
        next(err);
    }
}

module.exports.getCart = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  if (req.user.role == "admin") {
		isAdmin = true;
  } else {
		isAdmin = false;
  }
  try {
    let user = await Users.findOne({ _id: req.user._id }).populate("cart.id");

    let totalPrice = 0;
    user.cart.forEach((item) => {
      totalPrice += item.id.price*item.quantity;
    })
    res.render('shop/cart', {
      cart: user.cart,
      totalPrice,
      isLoggedIn: req.isAuthenticated(),
      isAdmin,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
}

module.exports.getIncreaseQuantity = async (req, res, next) => {
const { id } = req.params;
let cart = req.user.cart;
let indx = -1;
cart.forEach((item, i) => {
  if (item.id == id) {
    indx = i;
  }
});
if(indx != -1 ) cart[indx].quantity++;

await req.user.save();
try {
  let user = await Users.findOne({ _id: req.user._id }).populate("cart.id");
  let totalPrice = 0;
  user.cart.forEach((item) => {
    totalPrice += item.id.price * item.quantity;
  });
  res.send({
    id: user.cart,
    totalPrice,
  });
} catch (err) {
  next(err);
}
}
 
module.exports.getDecreaseQuantity = async (req, res, next) => {
  const { id } = req.params;
  let cart = req.user.cart;
  let indx = -1;
  cart.forEach((item, i) => {
    if (item.id == id) {
      indx = i;
    }
  });
  // console.log(cart[indx].quantity);
  if (indx != -1 && cart[indx].quantity > 1)
    cart[indx].quantity--;
  else if (indx != -1 && cart[indx].quantity == 1)
    cart.splice(indx, 1);
  await req.user.save();
  try {
    let user = await Users.findOne({ _id: req.user._id }).populate("cart.id");
    let totalPrice = 0;
    user.cart.forEach((item) => {
      totalPrice += item.id.price * item.quantity;
    });
    res.send({
      id: user.cart,
      totalPrice,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getCartBuy = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  if (req.user.role == "admin") {
		isAdmin = true;
  } else {
		isAdmin = false;
  }
  let user = await Users.findOne({ _id: req.user.id }).populate("cart.id");
  try {
    let totalPrice = 0;
    user.cart.forEach((item) => {
      totalPrice += item.id.price * item.quantity;
    });
    res.render("shop/buy", {
      cart: user.cart,
      totalPrice,
      isLoggedIn: req.isAuthenticated(),
      isAdmin
    });
  } catch (err) {
    next(err);
  }
};

module.exports.postCartBuy = async (req, res, next) => {
  if (req.user.role == "admin") {
		isAdmin = true;
  } else {
		isAdmin = false;
  }
  const { house, street, city, zipcode, phone, email, totalPrice } = req.body;
  let user = await Users.findOne({ _id: req.user._id }).populate("cart.id");
  try {
    user.address.house = house;
    user.address.street = street;
    user.address.city = city;
    user.address.zipcode = zipcode;
    user.address.phone = phone;

    let cart = user.cart;
    let oldOrders = user.orders;
    let newOrder = [];
    for (let i = 0; i < cart.length; i++){
      const item = cart[i];
      let order = {};
      let product = await Products.findOne({ _id: item.id });
      order.product = product;
      order.quantity = item.quantity;
      order.price = product.price * item.quantity;
      newOrder.push(order);
    }
    let order = {};
    order.products = [...newOrder]; // copy array
    order.totalPrice = totalPrice;
    oldOrders.unshift(order);
    user.cart = [];
    // console.log(user.cart);
    // console.log(user.orders);
    await user.save();
    // res.send(user.orders);
    res.render('shop/order-history', {
      totalPrice,
      isLoggedIn: req.isAuthenticated(),
      isAdmin,
      orders: oldOrders,
      msg:"Your Order Is Successfully Placed!!"
    })
  } catch (err) {
    next(err);
  }
}

module.exports.getOrderHistory = async (req, res, next) => {
  if (!req.isAuthenticated()) {
		return res.redirect("/");
  }
  if (req.user.role == "admin") {
		isAdmin = true;
  } else {
		isAdmin = false;
  }
  res.render("shop/order-history", {
    isAdmin,
    isLoggedIn: req.isAuthenticated(),
    orders: req.user.orders
  });
}