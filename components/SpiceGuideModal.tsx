import React from 'react';
import { X, Lock, Unlock, Star, Flame, Leaf, Award } from 'lucide-react';

interface SpiceGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    isUnlocked: boolean;
    onUnlock: () => void;
}

const SpiceGuideModal: React.FC<SpiceGuideModalProps> = ({ isOpen, onClose, isUnlocked, onUnlock }) => {
    if (!isOpen) return null;

    const spices = [
        {
            name: "Berbere",
            origin: "Ethiopia",
            profile: "Complex, Spicy, Sweet",
            benefit: "Anti-inflammatory",
            tip: "The backbone of Doro Wat. Bloom in oil first to release aromatics."
        },
        {
            name: "Egusi",
            origin: "West Africa",
            profile: "Nutty, Rich, Creamy",
            benefit: "High in Protein & Healthy Fats",
            tip: "Toast lightly before grinding for a deeper, nuttier flavor in soups."
        },
        {
            name: "Scotch Bonnet",
            origin: "Caribbean / West Africa",
            profile: "Fruity, Intense Heat",
            benefit: "Boosts Metabolism",
            tip: "For flavor without fire, prick the whole pepper and simmer, then remove."
        },
        {
            name: "Sumbala (Dawadawa)",
            origin: "West Africa",
            profile: "Deep Umami, Pungent",
            benefit: "Probiotic properties",
            tip: "The traditional bouillon cube. Use it to add savory depth to rice dishes."
        },
        {
            name: "Grains of Paradise",
            origin: "West Africa",
            profile: "Peppery, Citrusy, Woody",
            benefit: "Digestive aid",
            tip: "A complex alternative to black pepper. Crushed fresh over grilled fish."
        },
        {
            name: "Ras el Hanout",
            origin: "North Africa",
            profile: "Aromatic, Warm, Floral",
            benefit: "Antioxidant-rich",
            tip: "Literally 'top of the shop'. Use as a dry rub for lamb or chicken."
        },
        {
            name: "Suya Spice (Yaji)",
            origin: "Nigeria",
            profile: "Smoky, Nutty, Spicy",
            benefit: "Appetite stimulant",
            tip: "Contains ground peanuts. The ultimate street food finish for grilled meats."
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col md:flex-row">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white rounded-full transition z-20 shadow-sm"
                >
                    <X size={20} />
                </button>

                {/* Left Side - Premium Cover */}
                <div className="md:w-1/3 bg-africa-earth text-white p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-africa-accent/30 to-black/60 z-0"></div>
                    <div className="relative z-10">
                        <div className="flex items-center space-x-2 text-africa-gold mb-4">
                            <Star size={16} fill="currentColor" />
                            <span className="text-xs font-bold tracking-widest uppercase">Premium Guide</span>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-4">
                            The Alchemist's <br /> Cabinet
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Unlock the ancient secrets of African flavor. A curated masterclass in spices, sourcing, and usage.
                        </p>
                    </div>

                    <div className="relative z-10 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                            <p className="text-xs text-africa-gold uppercase font-bold mb-1">Inside This Guide</p>
                            <ul className="text-sm space-y-2">
                                <li className="flex items-center"><Leaf size={14} className="mr-2" /> 7 Essential Spice Profiles</li>
                                <li className="flex items-center"><Flame size={14} className="mr-2" /> Chef's Usage Tips</li>
                                <li className="flex items-center"><Award size={14} className="mr-2" /> <b>Bonus:</b> Secret Spice Blend Recipe</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Side - Content */}
                <div className="md:w-2/3 bg-gray-50 overflow-y-auto relative">
                    {isUnlocked ? (
                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-africa-earth">Your Masterclass</h2>
                                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                                    <Unlock size={12} className="mr-1" /> Unlocked
                                </span>
                            </div>

                            <div className="grid gap-4">
                                {spices.map((spice, idx) => (
                                    <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-africa-gold/30 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-lg text-africa-earth">{spice.name}</h4>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">{spice.origin}</p>
                                            </div>
                                            <span className="text-xs font-semibold bg-orange-50 text-africa-accent px-2 py-1 rounded">
                                                {spice.profile}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 italic">"{spice.tip}"</p>
                                        <div className="flex items-center text-xs text-green-600">
                                            <Leaf size={12} className="mr-1" /> Benefit: {spice.benefit}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* BONUS SECTION */}
                            <div className="bg-africa-earth text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-africa-gold rounded-full opacity-20 blur-xl"></div>
                                <h3 className="text-xl font-serif font-bold mb-4 relative z-10 flex items-center">
                                    <Star size={20} className="text-africa-gold mr-2" fill="#D4B483" />
                                    Bonus: The "Motherland" Rub
                                </h3>
                                <p className="text-sm text-gray-300 mb-4">
                                    A versatile all-purpose seasoning for chicken, fish, or roasted vegetables.
                                </p>
                                <div className="bg-white/10 p-4 rounded-lg text-sm font-mono space-y-1">
                                    <p>• 2 tbsp Smoked Paprika</p>
                                    <p>• 1 tbsp Garlic Powder</p>
                                    <p>• 1 tbsp Ginger Powder</p>
                                    <p>• 1 tsp Cinnamon</p>
                                    <p>• 1/2 tsp Nutmeg</p>
                                    <p>• 1 tsp Cayenne (adjust to taste)</p>
                                    <p className="mt-2 text-africa-gold italic">// Mix well and store in an airtight jar.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col relative">
                            {/* Teaser Content (Blurred) */}
                            <div className="p-8 space-y-6 filter blur-sm select-none opacity-40 pointer-events-none overflow-hidden">
                                <div className="h-8 w-1/2 bg-gray-300 rounded mb-6"></div>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 h-32"></div>
                                ))}
                                <div className="bg-gray-800 h-48 rounded-2xl"></div>
                            </div>

                            {/* Lock Overlay */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] p-6 text-center">
                                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-gray-100 transform transition-all hover:scale-105">
                                    <div className="w-16 h-16 bg-africa-accent/10 text-africa-accent rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Lock size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-africa-earth mb-2">Unlock the Full Guide</h3>
                                    <p className="text-gray-500 mb-6 text-sm">
                                        Get instant access to detailed profiles, chef's tips, and our <span className="font-bold text-africa-accent">Secret Spice Blend Recipe</span>.
                                    </p>

                                    <button
                                        onClick={onUnlock}
                                        className="w-full py-3.5 bg-gradient-to-r from-africa-accent to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-africa-accent transition-all flex items-center justify-center group"
                                    >
                                        <span>Create Free Account</span>
                                        <Unlock size={18} className="ml-2 group-hover:rotate-12 transition-transform" />
                                    </button>
                                    <p className="text-xs text-gray-400 mt-4">
                                        Already a member? <button onClick={onUnlock} className="text-africa-earth font-bold hover:underline">Sign In</button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SpiceGuideModal;
