var express = require('express');
var router = express.Router();


router.get('/count', function (req, res, next) {
    let count = 0;
    if (req.cookies.count) count = Number(req.cookies.count);

    count += 1;
    res.cookie("count", count);
    res.render('cookies/count', { count: count });
});


const products = [
    { id: 1, title: 'The history of web' },
    { id: 2, title: 'The next web' }
]

router.get("/products", function (req, res, next) {
    let output = '<ul>';
    for (let item in products) {
        output += `<li>
            <a href="/cookies/products/${products[item].id}">${products[item].title}</a>
        </li>`;
    }
    output += '</ul>';
    res.render('cookies/proudcts', { output: output, products: products });
});


router.get("/cart/:id", function (req, res, next) {
    const id = req.params.id;
    let cart = {};
    if (req.cookies.cart) {
        cart = req.cookies.cart;
    }

    if (!cart[id]) cart[id] = 0;
    cart[id] = parseInt(cart[id]) + 1;

    res.cookie('cart', cart);
    res.render("cookies/cart", { cart: cart });
})



module.exports = router;

