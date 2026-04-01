import { Router } from "express";
import {
  validateId,
  validateProduct,
  validateProductUpdate,
} from "../middleware/productValidation.js";
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../db/products.js";
const router = Router();

router.get("/", validateId, async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

router.get("/:id", validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//TODO: Add more routes as needed

//TODO GET /products/:slug

router.post("/", validateId, validateProduct, async (req, res) => {
  try {
    const { name, description, image, lightRequirements, coordinates, owner } =
      req.body;

    const product = await createProduct({
      name,
      description,
      image,
      lightRequirements,
      coordinates,
      owner,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("POST /products error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch(
  "/:id",
  validateId,
  validateProductUpdate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedProduct = await updateProduct(id, updateData);

      if (!updatedProduct) {
        return res.status(404).json({ message: "No product found" });
      }

      return res.json(updatedProduct);
    } catch (error) {
      console.error("PATCH /products error: ", error);
      return res.json(500).json({ message: "Server error" });
    }
  },
);

router.delete("/:id", validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = deleteProduct(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(201).json(deletedProduct)
  } catch (error) {
    res.status(500).json({message: 'Server error', error})
  }
});

//TODO PUT /products/:slug

//TODO DELETE /products/:slug
export default router;