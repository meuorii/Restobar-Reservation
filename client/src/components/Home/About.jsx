// src/components/About.jsx
import { MapPin, Clock, Phone } from "lucide-react";

const About = () => {
  return (
    <section className="bg-black text-white py-32 px-4" id="about">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Image Section */}
        <div className="w-full h-80 md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
          <img
            src="/image/about.jpg"
            alt="Restobar ambiance"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Text Section */}
        <div className="text-left space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-500">
            About Venice Restobar
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Venice Restobar offers an unforgettable dining experience in the heart of 
            <span className="text-yellow-500"> Masinloc, Zambales</span>. 
            We blend good food, drinks, and ambiance to create the perfect spot 
            for your celebrations and chill nights.
          </p>

          {/* Info Icons */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <MapPin className="text-yellow-500" size={26} />
              <div>
                <h3 className="font-semibold text-lg">Location</h3>
                <p className="text-gray-300">Masinloc, Zambales</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Clock className="text-yellow-500" size={26} />
              <div>
                <h3 className="font-semibold text-lg">Business Hours</h3>
                <p className="text-gray-300">Mon - Sun: 11:00 AM – 10:00 PM</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Phone className="text-yellow-500" size={26} />
              <div>
                <h3 className="font-semibold text-lg">Contact</h3>
                <p className="text-gray-300">+63 912 345 6789</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
