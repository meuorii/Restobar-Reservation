// src/components/FeaturedMenu.jsx
const featuredMenu = [
    {
      category: "Starters",
      items: [
        {
          name: "Garlic Butter Shrimp",
          desc: "Juicy shrimp sautéed in garlic butter sauce",
          price: "₱299",
          img: "/image/FeaturedMenu/Garlic-Buttered-Shrimp.jpg",
        },
        {
          name: "Spicy Buffalo Wings",
          desc: "Classic hot wings served with ranch dip",
          price: "₱249",
          img: "/image/FeaturedMenu/Spicy-Buffalo-Wings.jpg",
        },
      ],
    },
    {
      category: "Grilled & Main Dishes",
      items: [
        {
          name: "Grilled Baby Back Ribs",
          desc: "Slow-cooked ribs glazed with BBQ sauce",
          price: "₱549",
          img: "/image/FeaturedMenu/Grilled-Baby-Back-Ribs.jpg",
        },
        {
          name: "Sizzling Sisig",
          desc: "Classic Filipino crispy pork sisig served on a hot plate",
          price: "₱279",
          img: "/image/FeaturedMenu/Sizzling-Sisig.jpg",
        },
      ],
    },
    {
      category: "Bar Bites & Snacks",
      items: [
        {
          name: "Loaded Fries",
          desc: "Crispy fries topped with cheese, bacon bits & jalapeños",
          price: "₱199",
          img: "/image/FeaturedMenu/Loaded-Fries.jpg",
        },
        {
          name: "Beef Sliders (Mini Burgers)",
          desc: "Juicy mini burgers with melted cheese",
          price: "₱259",
          img: "/image/FeaturedMenu/Beef-Sliders.jpg",
        },
      ],
    },
    {
      category: "Cocktails & Mixed Drinks",
      items: [
        {
          name: "Margarita",
          desc: "Classic tequila-based cocktail with a salt-rimmed glass",
          price: "₱180",
          img: "/image/FeaturedMenu/Margarita.jpg",
        },
        {
          name: "Mojito",
          desc: "Refreshing mint & lime cocktail with white rum",
          price: "₱170",
          img: "/image/FeaturedMenu/Mojito.jpg",
        },
      ],
    },
    {
      category: "Beer & Alcoholic Beverages",
      items: [
        {
          name: "Classic Pale Pilsen",
          desc: "Best-selling local beer",
          price: "₱85",
          img: "/image/FeaturedMenu/Pale-Pilsen.jpg",
        },
        {
          name: "Corona Extra",
          desc: "Crisp and refreshing imported Mexican beer",
          price: "₱120",
          img: "/image/FeaturedMenu/Corona-Extra.jpg",
        },
      ],
    },
    {
      category: "Non-Alcoholic Drinks",
      items: [
        {
          name: "Fresh Mango Shake",
          desc: "Creamy, tropical mango smoothie",
          price: "₱110",
          img: "/image/FeaturedMenu/Fresh-Mango-Shake.jpg",
        },
        {
          name: "Cold Brew Coffee",
          desc: "Strong & smooth iced coffee",
          price: "₱130",
          img: "/image/FeaturedMenu/Cold-Brew-Coffee.jpg",
        },
      ],
    },
  ];
  
  
  const FeaturedMenu = () => {
    return (
      <section className="bg-black text-white py-16 px-4" id="menu">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 text-center mb-10">
                Featured Menu (Best Sellers)
          </h2>
  
          {featuredMenu.map((section, idx) => (
            <div key={idx} className="mb-12">
              <h3 className="text-2xl font-semibold mb-6 border-b border-yellow-500 inline-block">
                {section.category}
              </h3>
              <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-8">
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition"
                  >
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-72 object-cover"
                    />
                    <div className="p-4">
                        <h4 className="text-xl font-semibold text-yellow-400">
                            {item.name}
                        </h4>
                    <p className="text-sm text-gray-400 mb-1">{item.price}</p>
                    <p className="text-gray-300 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
  
          <div className="text-center mt-10">
            <a
              href="/menu"
              className="inline-block bg-yellow-500 text-black px-6 py-3 rounded-full text-lg font-semibold hover:bg-yellow-400 transition"
            >
              View Full Menu
            </a>
          </div>
        </div>
      </section>
    );
  };
  
  export default FeaturedMenu;
  