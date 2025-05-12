// src/components/CTA.jsx
const CTA = () => {
    return (
      <section
        id="reservation"
        className="bg-yellow-500 text-black py-16 px-4 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Dine with Us?
          </h2>
          <p className="text-lg md:text-xl mb-6">
            Book your table now and enjoy a relaxing experience at Venice Restobar —
            where good food and great moments meet.
          </p>
          <a
            href="/reservation"
            className="inline-block bg-black text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition"
          >
            Book a Table
          </a>
        </div>
      </section>
    );
  };
  
  export default CTA;
  