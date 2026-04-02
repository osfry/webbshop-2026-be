import Product from "../models/Product.js";
import Trade from "../models/Trade.js";

export async function getProducts() {
    return await Product.find().populate('owner', 'name');
}

export async function getProductById(id) {
    return await Product.findById(id).populate('owner', 'name email')
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

export async function updateProduct(id, updateData) {
  try {
    // 1. Vi skickar in ID:t på produkten
    // 2. Vi skickar in den nya datan (updateData)
    // 3. Vi skickar med ett options-objekt
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true  
      }
    );

    return updatedProduct;
  } catch (error) {
    console.error("Error in updateProduct:", error);
    throw error;
  }
}

export async function deleteProduct(id) {
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return null;
    }

    await Trade.deleteMany({ product: id });

    return deletedProduct;
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw error;
  }
}
//TODO: Add more functions as needed