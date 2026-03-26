import { describe, it, expect, afterAll, beforeEach } from "vitest";
import Product from "../../src/models/Product.js";
import request from "supertest";
import app from "../../src/app.js";
import { clearDatabase } from "../setup.js";

describe("API products routes", () => {
  beforeEach(async () => {
    await clearDatabase();

    const products = [
      new Product({ name: "Product 1", price: 100, stock: 10, image: "image.jpg", slug: "product-1" }),
      new Product({ name: "Product 2", price: 200, stock: 20, image: "image.jpg", slug: "product-2" }),
      new Product({ name: "Product 3", price: 300, stock: 30, image: "image.jpg", slug: "product-3" })
    ];
    await Promise.all(products.map(product => product.save()));
  });

  afterAll(async () => {
    await clearDatabase();
  });

  describe("GET /api/products", () => {
    it("should return all products", async () => {
      const response = await request(app)
        .get("/products")
        .expect(200)
        .expect("Content-Type", /json/);
      const body = response.body;
      expect(body).toHaveLength(3);
    });
  });

  describe("POST /api/products", () => {
    it("should create a new product", async () => {
      const response = await request(app)
        .post("/products")
        .send({ name: "Product 4", price: 400, stock: 40, image: "image.jpg", slug: "product-4" })
        .expect(201)
        .expect("Content-Type", /json/);
      const body = response.body;
      expect(body.name).toBe("Product 4");
    });
  });

  describe("GET /api/products/:slug", () => {
    it("should return a product by slug", async () => {
      const response = await request(app)
        .get("/products/product-1")
        .expect(200)
        .expect("Content-Type", /json/);
      const body = response.body;
      expect(body.name).toBe("Product 1");
    });
  });
});
