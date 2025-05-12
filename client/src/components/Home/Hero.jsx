// src/components/Hero.jsx
const Hero = () => {
    return (
      <section
        id="home"
        className="relative w-full h-screen flex items-center justify-center bg-center bg-cover"
        style={{
          backgroundImage:
            "url('/image/Restobar.jpg')", // Replace with your own restobar image if needed
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
  
        {/* Content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Dine, Drink, and Celebrate <br className="hidden md:inline" />
            <span className="text-amber-600">– Book Your Table Now!</span>
          </h1>
          <a
            href="#reservation"
            className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full text-lg hover:bg-yellow-400 transition duration-300"
          >
            Reserve Now
          </a>
        </div>
      </section>
    );
  };
  
  export default Hero;
  