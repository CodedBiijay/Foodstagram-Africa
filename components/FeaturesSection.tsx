import React from 'react';
import { Camera, Sparkles, ChefHat } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Camera size={32} />,
      title: "1. Snap or Upload",
      description: "Take a photo of any African or Caribbean dish, or upload an image from your gallery."
    },
    {
      icon: <Sparkles size={32} />,
      title: "2. AI Analysis",
      description: "Our advanced AI identifies the dish, its origin, and breaks down the flavor profile instantly."
    },
    {
      icon: <ChefHat size={32} />,
      title: "3. Cook & Enjoy",
      description: "Get a complete, authentic recipe with step-by-step instructions and video guides."
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-africa-earth mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discovering your culinary heritage has never been easier.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-orange-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-africa-accent/10 text-africa-accent rounded-full flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-africa-earth mb-3">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
