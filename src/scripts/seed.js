import "dotenv/config";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { connectToDatabase } from "../config/database.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

const users = [
  {
    name: "Oscar Andersson",
    email: "oscar@example.com",
    password: "password123",
  },
  {
    name: "Emma Nilsson",
    email: "emma@example.com",
    password: "password123",
  },
  {
    name: "Liam Svensson",
    email: "liam@example.com",
    password: "password123",
  },
  {
    name: "Maja Karlsson",
    email: "maja@example.com",
    password: "password123",
  },
  {
    name: "Noah Eriksson",
    email: "noah@example.com",
    password: "password123",
  },
];

const products = [
  {
    name: "Monstera Deliciosa",
    image: "https://images.example.com/monstera.jpg",
    lightRequirements: 2,
    coordinates: "59.3293,18.0686",
  },
  {
    name: "Snake Plant",
    image: "https://images.example.com/snake-plant.jpg",
    lightRequirements: 1,
    coordinates: "57.7089,11.9746",
  },
  {
    name: "Peace Lily",
    image: "https://images.example.com/peace-lily.jpg",
    lightRequirements: 2,
    coordinates: "55.6049,13.0038",
  },
  {
    name: "Fiddle Leaf Fig",
    image: "https://images.example.com/fiddle-leaf-fig.jpg",
    lightRequirements: 3,
    coordinates: "59.8586,17.6389",
  },
  {
    name: "Pothos",
    image: "https://images.example.com/pothos.jpg",
    lightRequirements: 1,
    coordinates: "63.8258,20.2630",
  },
];

export async function seedDatabase() {
  try {
    await Product.syncIndexes();
    await User.deleteMany({});
    await Product.deleteMany({});

    const createdUsers = await User.insertMany(users);
    const createdProducts = await Product.insertMany(products);

    console.log(`Seed complete: ${createdUsers.length} users, ${createdProducts.length} products.`);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  }
}

const isRunDirectly = process.argv[1] === fileURLToPath(import.meta.url);

if (isRunDirectly) {
  const run = async () => {
    try {
      await connectToDatabase();
      await seedDatabase();
    } finally {
      await mongoose.disconnect();
    }
  };

  run();
}
