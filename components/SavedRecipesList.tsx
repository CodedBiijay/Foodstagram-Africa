import React, { useState } from 'react';
import { RecipeData } from '../types';
import { Clock, ChefHat, Trash2, ArrowRight, BookOpen, CloudOff, Heart, History, PlusCircle } from 'lucide-react';

interface SavedRecipesListProps {
  recipes: RecipeData[];
  history: RecipeData[];
  onSelectRecipe: (recipe: RecipeData) => void;
  onDeleteRecipe: (recipe: RecipeData) => void;
  onSaveHistoryItem: (recipe: RecipeData) => void;
  onBack: () => void;
}

const SavedRecipesList: React.FC<SavedRecipesListProps> = ({
  recipes,
  history,
  onSelectRecipe,
  onDeleteRecipe,
  onSaveHistoryItem,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');

  const displayList = activeTab === 'favorites' ? recipes : history;

  if (recipes.length === 0 && history.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-20 animate-fade-in bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
        <div className="w-24 h-24 bg-africa-sand/50 rounded-full flex items-center justify-center mx-auto mb-6 text-africa-earth">
          <BookOpen size={40} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-africa-earth mb-2">Your cookbook is empty</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">Start exploring the taste of Africa! When you find a recipe you love, save it here for later.</p>
        <button
          onClick={onBack}
          className="px-8 py-3 bg-africa-earth text-white rounded-full font-bold hover:bg-gray-800 transition transform hover:-translate-y-1 shadow-lg"
        >
          Discover Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-africa-earth flex items-center">
          <BookOpen className="mr-3" /> My Cookbook
        </h2>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-africa-accent text-white rounded-full font-bold shadow hover:bg-orange-600 transition"
        >
          + Analyze New Dish
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center sm:justify-start mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-6 py-3 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'favorites'
              ? 'border-africa-accent text-africa-accent'
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
        >
          <Heart size={16} className={activeTab === 'favorites' ? 'fill-current' : ''} />
          <span>Favorites ({recipes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-bold text-sm flex items-center space-x-2 border-b-2 transition-colors ${activeTab === 'history'
              ? 'border-africa-accent text-africa-accent'
              : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
        >
          <History size={16} />
          <span>History ({history.length})</span>
        </button>
      </div>

      <div className="mb-4 text-xs text-gray-500 font-medium flex items-center justify-center sm:justify-start">
        <CloudOff size={12} className="mr-1" /> Available offline via secure local storage
      </div>

      {displayList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 font-medium">No items in {activeTab}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayList.map((recipe, idx) => (
            <div key={recipe.id || idx} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col group relative">

              {/* Badge for History items indicating if they are already saved */}
              {activeTab === 'history' && recipes.some(r => r.dishName === recipe.dishName) && (
                <div className="absolute top-4 left-4 z-20 bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center shadow-sm">
                  <Heart size={10} className="mr-1 fill-current" /> Saved
                </div>
              )}

              <div className="h-36 bg-africa-sand/20 flex items-center justify-center p-6 relative">
                <div className="absolute inset-0 bg-africa-earth/5 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <h3 className="text-2xl font-serif font-bold text-africa-earth text-center line-clamp-2 z-10">{recipe.dishName}</h3>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-africa-earth uppercase tracking-wider shadow-sm">
                  {recipe.origin}
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col">
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow italic">"{recipe.description}"</p>

                <div className="flex items-center gap-4 text-xs font-bold text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <span className="flex items-center text-africa-earth"><Clock size={14} className="mr-1 text-africa-accent" /> {recipe.cookingTime}</span>
                  <span className="flex items-center text-africa-earth"><ChefHat size={14} className="mr-1 text-africa-accent" /> {recipe.difficulty}</span>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                {activeTab === 'favorites' ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteRecipe(recipe); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    title="Remove from Favorites"
                  >
                    <Trash2 size={18} />
                  </button>
                ) : (
                  // History Tab Actions
                  <div className="flex items-center">
                    {!recipes.some(r => r.dishName === recipe.dishName) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSaveHistoryItem(recipe); }}
                        className="p-2 text-gray-400 hover:text-africa-accent hover:bg-orange-50 rounded-full transition mr-1"
                        title="Save to Favorites"
                      >
                        <Heart size={18} />
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={() => onSelectRecipe(recipe)}
                  className="flex items-center text-africa-earth font-bold hover:text-africa-accent transition group-hover:translate-x-1 duration-300"
                >
                  View Recipe <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipesList;