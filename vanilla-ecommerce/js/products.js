// products.js
// -----------
// This file only contains the product "data".
// It exports an array of product objects that app.js will use to build the UI.

/**
 * Each product has:
 * - id:       a unique identifier
 * - name:     a display name
 * - price:    a number representing the price
 * - image:    a URL for the image (can be remote or local)
 */
const products = [
  {
    id: 1,
    name: "Deep Blue Hoodie",
    price: 59.0,
    image: "https://source.unsplash.com/600x400/?hoodie,blue",
  },
  {
    id: 2,
    name: "Minimalist White Tee",
    price: 29.0,
    image: "https://source.unsplash.com/600x400/?white+shirt,tee",
  },
  {
    id: 3,
    name: "Slate Joggers",
    price: 68.0,
    image: "https://source.unsplash.com/600x400/?joggers",
  },
  {
    id: 4,
    name: "Everyday Sneakers",
    price: 89.0,
    image: "https://source.unsplash.com/600x400/?sneakers",
  },
  {
    id: 5,
    name: "Structured Tote Bag",
    price: 75.0,
    image: "https://source.unsplash.com/600x400/?tote+bag",
  },
  {
    id: 6,
    name: "Midnight Cap",
    price: 24.0,
    image: "https://source.unsplash.com/600x400/?cap,baseball+cap",
  },
  {
    id: 7,
    name: "Cozy Wool Scarf",
    price: 34.0,
    image: "https://source.unsplash.com/600x400/?wool+scarf",
  },
  {
    id: 8,
    name: "Classic Leather Belt",
    price: 42.0,
    image: "https://source.unsplash.com/600x400/?leather+belt",
  },
  {
    id: 9,
    name: "Eco Water Bottle",
    price: 22.0,
    image: "https://source.unsplash.com/600x400/?water+bottle,reusable",
  },
];

