import { PencilLine, Clock, Utensils } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="bg-black text-white py-20 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-500 mb-10">
          How It Works
        </h2>

        <div className="grid gap-10 md:grid-cols-3 text-left">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-yellow-500 text-black p-4 rounded-full mb-4">
              <PencilLine size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Fill Out the Form</h3>
            <p className="text-gray-300">
              Choose your date, time, and table preferences. It's quick and easy.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-yellow-500 text-black p-4 rounded-full mb-4">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Wait for Confirmation</h3>
            <p className="text-gray-300">
              You'll receive a confirmation via email or SMS once approved by staff.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-yellow-500 text-black p-4 rounded-full mb-4">
              <Utensils size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Enjoy Your Meal!</h3>
            <p className="text-gray-300">
              Come in, relax, and let us serve you an unforgettable dining experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
