import React, { useEffect, useState } from 'react';

const tips = [
  "Chef's Tip: For the deepest flavor profile in Jollof, allow the stew base to caramelize slightly before adding rice.",
  "Culinary Note: Authentic Egusi soup relies on the emulsion of melon seeds and palm oil for that signature texture.",
  "Technique: To achieve the perfect honeycomb structure in Injera, ensure your fermentation starter is active.",
  "Did you know? Pounding Fufu aerates the starch, creating a smoother, more elastic texture than stirring alone.",
  "Sourcing: If you can't find scotch bonnet peppers, habaneros offer a similar heat profile, though slightly fruitier.",
  "History: Biltong curing techniques date back centuries as a vital preservation method in Southern Africa.",
  "Flavor Profile: Unrefined Red Palm Oil is essential for the earthy, distinct taste of West African soups.",
  "Pairing: Rooibos tea contains no tannins, making it a naturally sweet pairing for savory dishes."
];

const LoadingOverlay: React.FC = () => {
  const [tip, setTip] = useState(tips[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTip(tips[Math.floor(Math.random() * tips.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-africa-earth/95 z-50 flex flex-col items-center justify-center text-white p-6 text-center">
      <div className="w-24 h-24 border-4 border-africa-gold border-t-transparent rounded-full animate-spin mb-8"></div>
      <h2 className="text-3xl font-serif font-bold mb-4 animate-pulse">Curating Culinary History...</h2>
      <p className="text-lg text-africa-sand max-w-lg leading-relaxed italic font-light">"{tip}"</p>
    </div>
  );
};

export default LoadingOverlay;