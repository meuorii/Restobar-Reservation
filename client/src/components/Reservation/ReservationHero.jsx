// src/components/ReservationHero.jsx
const ReservationHero = () => {
    return (
      <section
        className="w-full h-72 md:h-96 bg-cover bg-center flex items-center justify-center relative"
        style={{
          backgroundImage:
            "url('/image/ReservationHero.jpg')", // Replace with your own image path
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Book Your Table
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Secure your spot with a quick reservation!
          </p>
        </div>
      </section>
    );
  };
  
  export default ReservationHero;
  