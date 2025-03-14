
const express = require('express')
const cors = require("cors")
require('./db/config');
const User = require('./db/User');
const Product=require('./db/Product')
const Cart=require('./db/Cart')
const Order=require('./db/Order')
const jwt=require('jsonwebtoken')
const app = express()
const jwtkey='e-com'
const sharp = require('sharp');
app.use(express.json());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


app.post("/register", async (req, resp) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;

    jwt.sign({ user: result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            resp.send({ result: "Something went wrong, please try again later" });
        }
        resp.send({ user: result, auth: token });
    });
});
app.post("/login", async (req, resp) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    resp.send({ result: "Something went wrong, please try again later" });
                }
                resp.send({ user, auth: token });
            });
        } else {
            resp.send({ result: "No user found" });
        }
    } else {
        resp.send({ result: "Invalid credentials" });
    }
});


app.post('/add-product', async (req, res) => {
    try {
        const { name, price, catagory, company, userId, image, imageType } = req.body;

        console.log("Received Image Data (First 100 chars):", image ? image.substring(0, 100) : "No Image");
        console.log("Image Type:", imageType);

        if (!image || !imageType) {
            return res.status(400).json({ error: "Image data is missing" });
        }

        const imageBuffer = Buffer.from(image, 'base64');
        const resizedImageBuffer = await sharp(imageBuffer)
            .resize({ width: 300 })
            .toBuffer();

        const product = new Product({
            name,
            price,
            catagory,
            company,
            userId,
            image: {
                data: resizedImageBuffer,
                contentType: imageType
            }
        });

        await product.save();
        res.json({ message: "Product added successfully", product });

    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Failed to add product" });
    }
});
app.get("/products",async(req,resp)=>{
    let products=await Product.find();
    if(products.length>0){
        resp.send(products);
    }
    else{
        resp.send({result:"No products found"});
    }
})
app.delete("/product/:id", async (req, resp) => {
    try {
        let product = await Product.findOne({_id: req.params.id});
        if (!product) {
            resp.status(404).send({result: "No product found"});
            return;
        }
        const result = await Product.deleteOne({_id: req.params.id});
        if (result.deletedCount > 0) {
            resp.send({result: "Product deleted successfully"});
        } else {
            resp.send({result: "No product found to delete"});
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        resp.status(500).send({error: "Internal Server Error"});
    }
}); 
app.get("/product/:id",async(req,resp)=>{
    let result = await Product.findOne({_id: req.params.id}); 
    if(result){
        resp.send(result);
    }
    else{
        resp.send({result:"No Record Find"});
    }
})
app.put("/product/:id",async(req,resp)=>{
    let result=await Product.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    resp.send(result)
})
app.get("/search/:key",async(req,resp)=>{
    let result=await Product.find({
     "$or":[
        {name:{$regex:req.params.key}},
        {price:{$regex:req.params.key}},
        {catagory:{$regex:req.params.key}},
        {company:{$regex:req.params.key}}
    ]
    })
    resp.send(result);
})
app.post("/cart", async (req, resp) => {
    let cart = new Cart(req.body);
    console.log(req.body)
    let result = await cart.save();
    resp.send(result);
})
app.get("/search_carts/:id",async(req,resp)=>{
    let result = await Cart.find({userId: req.params.id,OrderStatus:"not confirm"});
    resp.send(result);
})
app.delete("/carts/:id", async (req, resp) => {
    try {
        let product = await Cart.findOne({_id: req.params.id});
        if (!product) {
            resp.status(404).send({result: "No product found"});
            return;
        }
        const result = await Cart.deleteOne({_id: req.params.id});
        if (result.deletedCount > 0) {
            resp.send({result: "Product deleted successfully"});
        } else {
            resp.send({result: "No product found to delete"});
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        resp.status(500).send({error: "Internal Server Error"});
    }
}); 
app.put("/update_cart_inc/:id",async(req,resp)=>{
    let result=await Cart.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    resp.send(result)
})
app.put("/update_cart_dec/:id",async(req,resp)=>{
    let result=await Cart.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    resp.send(result)
})
app.put("/update_cart_confirm/:id",async(req,resp)=>{
    let result=await Cart.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    resp.send(result)
})
app.post("/order", async (req, resp) => {
    let order = new Order(req.body);
    let result = await order.save();
    result=result.toObject()
    resp.send(result);
})
app.get("/search_pastcart/:id",async(req,resp)=>{
    let result = await Cart.find({userId: req.params.id,OrderStatus:"confirmed"});
    resp.send(result);
})
app.get("/search_order",async(req,resp)=>{
    let result = await Order.find({orderLabel:"preprocessing"});
    resp.send(result);
})
app.put("/update_order/:id",async(req,resp)=>{
    let result=await Order.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    resp.send(result)
})
app.get("/search_pastorder",async(req,resp)=>{
    let result = await Order.find({orderLabel:"delivered"});
    resp.send(result);
}) 
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});