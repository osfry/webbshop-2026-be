import { Router } from "express";
import { validateId, validateProduct, validateProductUpdate } from "../middleware/productValidation.js";
import { requireAuth } from "../middleware/auth.js";
import { getProducts, createProduct, getProductById, updateProduct, deleteProduct } from "../db/products.js";
import { productsReadLimiter } from "../middleware/rateLimit.js";
import upload from "../config/cloudinaryConfig.js";

const router = Router();

function parseProductFormData(req, res, next) {
  try {
    if (req.file) {
      req.body.image = req.file.path;
    }

    if (typeof req.body.coordinates === "string") {
      req.body.coordinates = JSON.parse(req.body.coordinates);
    }

    if (typeof req.body.lightRequirements === "string") {
      req.body.lightRequirements = Number(req.body.lightRequirements);
    }

    next();
  } catch {
    return res.status(400).json({ message: "Invalid form data" });
  }
}

router.get("/", productsReadLimiter, async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

router.get("/:id", productsReadLimiter, validateId, async (req, res) => {
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

router.post("/", requireAuth,upload.single("image"), parseProductFormData, validateProduct, async (req, res) => {
  try {
    const { name, description, image, lightRequirements, coordinates } = req.body;
    const ownerId = req.user.id;
    
    const product = await createProduct({
      name,
      description,
      image,
      lightRequirements,
      coordinates,
      owner: ownerId,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("POST /products error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.patch("/:id", requireAuth, validateId, validateProductUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    // Använder .toString() för att MongoDB-id är objekt-id
    if (product.owner._id.toString() !== userId) {
      return res.status(403).json({
        message: "You do not own the rights to edit this product",
      });
    }
    delete updateData.owner;

    const updatedProduct = await updateProduct(id, updateData);

    return res.json(updatedProduct);
  } catch (error) {
    console.error("PATCH /products error: ", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", requireAuth, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    if (product.owner._id.toString() !== userId) {
      return res.status(403).json({ 
        message: "You do not own the rights to delete this product"
      });
    }

    await deleteProduct(id);

    return res.status(200).json({ message: "Product has been deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//TODO PUT /products/:slug

//TODO DELETE /products/:slug
export default router;
