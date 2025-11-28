import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
    const testimonials = [
        {
            name: "Amara N.",
            role: "Home Cook",
            content: "I finally found the exact recipe for my grandmother's Egusi soup! This app is a treasure.",
            rating: 5
        },
        {
            name: "David K.",
            role: "Food Blogger",
            content: "The accuracy is incredible. It identified a rare Ghanaian dish from just a blurry photo.",
            rating: 5
        },
        {
            name: "Sarah J.",
            role: "Culinary Student",
            content: "A must-have for anyone interested in African cuisine. The history lessons are a bonus!",
            rating: 5
        }
    ];

    return (
        <section className="py-16 px-4 bg-africa-sand/20">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-africa-earth mb-4">
                        Loved by Foodies
                    </h2>
                    <p className="text-gray-600">
                        Join thousands of users preserving our culinary history.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex text-africa-gold mb-4">
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <p className="text-gray-600 mb-6 italic">"{t.content}"</p>
                            <div>
                                <p className="font-bold text-africa-earth">{t.name}</p>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">{t.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
