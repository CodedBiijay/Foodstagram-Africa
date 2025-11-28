import React, { useState } from 'react';
import { Camera, Upload, Image as ImageIcon, Link as LinkIcon, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

interface RecipeInputProps {
  onInputSubmit: (type: 'image' | 'text' | 'random', value: string, preview?: string) => void;
}

const RecipeInput: React.FC<RecipeInputProps> = ({ onInputSubmit }) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'link' | 'text'>('photo');
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  // --- Photo Handling ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      onInputSubmit('image', base64, result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // --- Link/Text Handling ---
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      // We pass the URL as text. The service will handle the prompt context.
      onInputSubmit('text', urlInput.trim());
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onInputSubmit('text', textInput.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 font-sans">
      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-2 sm:space-x-4">
        <button
          onClick={() => setActiveTab('photo')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 font-bold ${
            activeTab === 'photo' 
              ? 'bg-africa-earth text-white shadow-lg transform scale-105' 
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Camera size={18} className="mr-2" /> Photo
        </button>
        <button
          onClick={() => setActiveTab('link')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 font-bold ${
            activeTab === 'link' 
              ? 'bg-africa-earth text-white shadow-lg transform scale-105' 
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <LinkIcon size={18} className="mr-2" /> Reel / URL
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 font-bold ${
            activeTab === 'text' 
              ? 'bg-africa-earth text-white shadow-lg transform scale-105' 
              : 'bg-white text-gray-500 hover:bg-gray-100'
          }`}
        >
          <MessageSquare size={18} className="mr-2" /> Ask Chef
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-500 min-h-[300px]">
        
        {/* PHOTO TAB */}
        {activeTab === 'photo' && (
          <div 
            className={`
              h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 border-4 border-dashed m-2 rounded-2xl transition-colors duration-300
              ${isDragging ? 'border-africa-accent bg-orange-50' : 'border-gray-100 hover:border-africa-gold/50'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <input 
                type="file" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileChange}
              />
              <div className="w-20 h-20 bg-africa-clay/10 rounded-full flex items-center justify-center text-africa-clay mb-6">
                <Camera size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-africa-earth mb-2">
                Share Your Dish
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">
                Upload a photo or take a picture, and we'll identify the cuisine and recipe.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-africa-accent">
                <span className="flex items-center px-4 py-2 bg-orange-50 rounded-full">
                  <Upload size={16} className="mr-2" /> Upload
                </span>
                <span className="flex items-center px-4 py-2 bg-orange-50 rounded-full">
                  <ImageIcon size={16} className="mr-2" /> Drag & Drop
                </span>
              </div>
            </div>
          </div>
        )}

        {/* LINK TAB */}
        {activeTab === 'link' && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-africa-sand/10">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-africa-green/10 rounded-full flex items-center justify-center text-africa-green mx-auto">
                  <LinkIcon size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-africa-earth">Paste a Link</h3>
                <p className="text-gray-500 text-sm">Found inspiration on Instagram or TikTok? Paste the URL here.</p>
              </div>
              
              <form onSubmit={handleUrlSubmit} className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://instagram.com/reel/..."
                  className="w-full pl-6 pr-14 py-4 rounded-xl border-2 border-gray-100 focus:border-africa-green focus:ring-0 outline-none text-gray-700 bg-white shadow-sm transition-all"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-africa-green text-white p-2 rounded-lg hover:bg-teal-600 transition-colors"
                >
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 bg-orange-50/50">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-2">
                 <div className="w-16 h-16 bg-africa-accent/10 rounded-full flex items-center justify-center text-africa-accent mx-auto">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-africa-earth">Ask the Chef</h3>
                <p className="text-gray-500 text-sm">Request a specific recipe or describe a dish.</p>
              </div>

              <form onSubmit={handleTextSubmit} className="space-y-4">
                <textarea
                  required
                  placeholder="e.g. What is the traditional way to prepare Nigerian Jollof?"
                  className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-africa-accent focus:ring-0 outline-none text-gray-700 bg-white shadow-sm resize-none h-32"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className="w-full py-3 bg-africa-accent text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-transform transform hover:-translate-y-1"
                >
                  Get Recipe
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      <div className="mt-8 text-center animate-fade-in-up">
        <p className="text-gray-500 text-sm mb-3">Not sure what to cook?</p>
        <button 
          onClick={() => onInputSubmit('random', 'Surprise Me')}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-africa-accent to-orange-600 text-white rounded-full font-bold shadow-md hover:shadow-xl hover:scale-105 transition-all"
        >
            <Sparkles size={18} className="mr-2" /> I'm Feeling Hungry
        </button>
      </div>
    </div>
  );
};

export default RecipeInput;