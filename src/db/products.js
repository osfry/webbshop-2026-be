import Product from "../models/Product.js";

export async function getProducts() {
    return await Product.find().populate('owner', 'name');
}

export async function getProductById(id) {
    return await Product.findById(id).populate('owner', 'name', 'email')
}

export async function createProduct(productData) {
    try {
        const product = new Product(productData);
        await product.save();
        return product;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
}

//TODO: Add more functions as needed