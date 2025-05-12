const MenuCategory = ({ title, items }) => {
    return (
      <section>
        <h2 className="text-2xl md:text-3xl text-yellow-500 font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition"
            >
              <img src={item.img} alt={item.name} className="w-full h-96 object-cover" />
              <div className="p-4">
                <h4 className="text-xl text-yellow-400 font-semibold">{item.name}</h4>
                <p className="text-sm text-gray-400">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };
  
  export default MenuCategory;
  