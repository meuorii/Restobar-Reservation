// src/pages/Menu.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import MenuHero from "../components/Menu/MenuHero";
import MenuCategory from "../components/Menu/MenuCategory";
import menuData from "../data/menuData";

const categories = [
  "All",
  "Starters",
  "Grilled & Main Dishes",
  "Bar Bites & Snacks",
  "Cocktails & Mixed Drinks",
  "Beer & Alcoholic Beverages",
  "Non-Alcoholic Drinks",
];

const cleanCategory = (title) => title.replace(/[^a-zA-Z &]/g, "").trim();

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");

  const sortItems = (items) =>
    [...items].sort((a, b) => {
      const aPrice = parseFloat(a.price.replace("₱", ""));
      const bPrice = parseFloat(b.price.replace("₱", ""));
      return sortOrder === "asc" ? aPrice - bPrice : bPrice - aPrice;
    });

  const filteredSections =
    selectedCategory === "All"
      ? menuData.map((section) => ({
          title: section.title,
          items: sortItems(section.items),
        }))
      : menuData
          .filter((section) => cleanCategory(section.title) === selectedCategory)
          .map((section) => ({
            title: section.title,
            items: sortItems(section.items),
          }));

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <MenuHero />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Filter and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div>
            <label className="mr-2 text-yellow-500 font-medium">Filter:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-md"
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mr-2 text-yellow-500 font-medium">Sort by Price:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-md"
            >
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
          </div>
        </div>

        {/* Render filtered category sections */}
        {filteredSections.map((section, idx) => (
          <MenuCategory key={idx} title={section.title} items={section.items} />
        ))}
      </div>
    </div>
  );
};

export default Menu;
