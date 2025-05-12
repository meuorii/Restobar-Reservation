// src/components/MenuHero.jsx
import { useEffect, useState } from "react";

const images = [
  "image/MenuHero/Starters.jpg",
  "image/MenuHero/Grilled.jpg",
  "image/MenuHero/Bar-Bites.jpg",
  "image/MenuHero/Cocktails.jpg",
  "image/MenuHero/Beer.jpg",
  "image/MenuHero/Non-Alcoholic.jpg",
];

const MenuHero = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full h-72 md:h-96 overflow-hidden">
      {/* Sliding Images */}
      <div
        className="flex transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentImage * 100}%)` }}
      >
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Banner ${index}`}
            className="min-w-full h-72 md:h-96 object-cover"
          />
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Text Content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          Explore Our Menu
        </h1>
        <p className="text-lg md:text-xl text-gray-300">
          Delicious meals & refreshing drinks, all in one place!
        </p>
      </div>
    </section>
  );
};

export default MenuHero;
