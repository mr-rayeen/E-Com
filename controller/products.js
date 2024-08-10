const Products = require('../models/products');

module.exports.postProductsAdd = async (req, res, next) => {
    const { name, price, description, imageUrl, seller, category } = req.body;
    if (req.user.role != "admin") {
        return res.redirect("/")
    }
    try {
        await Products.create({
            name,
            price,
            description,
            imageUrl,
            seller,
            category
        });
        res.redirect('/admin/products/all');
    }
    catch(err){
        res.send(err)
    }
}
module.exports.getProductsAdd = async (req, res, next) => {
    if (req.user.role != "admin") {
		return res.redirect("/");
    }
    if (req.user.role == 'admin') {
        isAdmin = true;
    } else {
        isAdmin = false;
    }
    try {
        res.render("admin/add_products", {
            isLoggedIn: req.isAuthenticated(),
            isAdmin,
            user: req.user
        });
    }
    catch (err) {
        res.send(err);
    }
}
module.exports.getProductsAll = async (req, res, next) => {
    if (req.user.role != "admin") {
		return res.redirect("/");
    }
    if (req.user.role == "admin") {
		isAdmin = true;
    } else {
		isAdmin = false;
    }
    const products = await Products.find();
    let data = {};

    products.forEach((product) => {
        let arr = data[product.category] || [];
        arr.push(product);
        data[product.category] = arr;
    });
    res.render("admin/home", {
		products: data,
		isAdmin,
		isLoggedIn: req.isAuthenticated(),
		user: req.user
    });
}

module.exports.getProductUpdate = async (req, res, next) => {
    if (req.user.role != "admin") {
		return res.redirect("/");
    }
    if (req.user.role == "admin") {
		isAdmin = true;
    } else {
		isAdmin = false;
    }
    let { id } = req.params;
    try {
    const product = await Products.findById(id)
        res.render('admin/update_product', {
            product,
            isLoggedIn: req.isAuthenticated(),
            isAdmin,
            user: req.user
        });
    }
    catch (err) {
        next(err);
    }
}

module.exports.postProductUpdate = async (req, res)=>{
    let { name, price, imageUrl, seller, description, category, id } = req.body;
    if (req.user.role != "admin") {
		return res.redirect("/");
    }
    try {
        const product = await Products.findById(id);

        product.name = name;
        product.price = price;
        product.imageUrl = imageUrl;
        product.seller = seller;
        product.description = description;
        product.category = category;

        await product.save();
        res.redirect("/admin/products/all");
    }
    catch (err) {
        next(err);
    }

}
module.exports.getProductDelete = async (req, res, next)=>{
    if (req.user.role != "admin") {
		return res.redirect("/");
    }
    let { id } = req.params;
    try {
        await Products.findByIdAndDelete(id);
        res.redirect('/admin/products/all');
    }
    catch (err) {
        next(err);
    }
}
