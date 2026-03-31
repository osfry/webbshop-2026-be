import { Router } from "express";
import { validateProduct, validateProductResult } from "../middleware/productValidation.js";
import { getProducts, createProduct, getProductById } from "../db/products.js";
const router = Router();

router.get("/", async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: 'No product found' });
    }

    res.status(200).json(product); 
    
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

//TODO: Add more routes as needed

//TODO GET /products/:slug

router.post("/", validateProduct, validateProductResult, async (req, res) => {
  try {
    const {name, description, image, lightRequirements, coordinates, owner} = req.body

    const product = await createProduct(
      {name, description, image, lightRequirements, coordinates, owner}
    );
    res.status(201).json(product);

  } catch (error) {
  console.error("POST /products error:", error);
  return res.status(500).json({message: 'Server error'}) 
}
});

//TODO PUT /products/:slug

//TODO DELETE /products/:slug
export default router;