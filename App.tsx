import React, { useState, useEffect } from 'react';
import { ChefHat, Heart, MessageSquare, BookOpen, Key, WifiOff, Sparkles, User as UserIcon, LogOut } from 'lucide-react';
import RecipeInput from './components/ImageUpload';
import RecipeDisplay from './components/RecipeDisplay';
import SavedRecipesList from './components/SavedRecipesList';
import LoadingOverlay from './components/LoadingOverlay';
import AuthModal from './components/AuthModal';
import { generateRecipe, generateCookingVideo } from './services/geminiService';
import { AppState, RecipeData, User } from './types';
import { 
  saveRecipeToDB, 
  getSavedRecipesFromDB, 
  deleteRecipeFromDB, 
  migrateFromLocalStorage 
} from './services/storageService';
import { getCurrentUser, logoutUser } from './services/authService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<RecipeData[]>([]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Network status listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize DB, User and Load Data
  useEffect(() => {
    const initData = async () => {
      // Check for user session
      const user = getCurrentUser();
      setCurrentUser(user);

      await migrateFromLocalStorage();
      
      if (user) {
        // Load user specific recipes
        const recipes = await getSavedRecipesFromDB(user.id);
        setSavedRecipes(recipes);
      }
    };
    initData();
  }, []);

  // Reload recipes when user changes
  useEffect(() => {
    const loadRecipes = async () => {
      if (currentUser) {
        const recipes = await getSavedRecipesFromDB(currentUser.id);
        setSavedRecipes(recipes);
      } else {
        setSavedRecipes([]);
      }
    };
    loadRecipes();
  }, [currentUser]);

  const handleInputSubmit = async (type: 'image' | 'text' | 'random', value: string, preview?: string) => {
    if (isOffline) {
      setError("You are currently offline. Please connect to the internet to analyze new dishes.");
      setAppState(AppState.ERROR);
      return;
    }

    setAppState(AppState.ANALYZING);
    setError(null);
    setRecipeData(null);
    setVideoError(null);

    if (type === 'image' && preview) {
      setImagePreview(preview);
      setUserQuery(null);
    } else if (type === 'random') {
      setImagePreview(null);
      setUserQuery("Chef's Daily Special");
    } else {
      setImagePreview(null);
      setUserQuery(value);
    }

    try {
      const data = await generateRecipe({ type, value });
      // Add a temporary ID for keying if not present
      const dataWithId = { ...data, id: Date.now().toString() };
      setRecipeData(dataWithId);
      setAppState(AppState.RESULT);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "We were unable to process your request at this time. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleExploreRelated = async (dishName: string) => {
     // Re-use input submit logic but with the new dish name text
     await handleInputSubmit('text', `Recipe for ${dishName}`);
  };

  const handleGenerateVideo = async () => {
    if (isOffline) {
      setVideoError("Internet connection required for video generation.");
      return;
    }

    if (!recipeData) return;
    setVideoError(null);

    // API Key Check for Veo
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        try {
          await window.aistudio.openSelectKey();
          // We assume success and proceed
        } catch (e) {
          console.error("API Key selection failed", e);
          setVideoError("API Key selection is required for video generation.");
          return;
        }
      }
    }

    setIsGeneratingVideo(true);
    try {
      const uri = await generateCookingVideo(recipeData.dishName, recipeData.origin);
      const updatedRecipe = { ...recipeData, videoUri: uri };
      setRecipeData(updatedRecipe);
      
      // Update in DB if saved and user logged in
      if (currentUser && savedRecipes.some(r => r.dishName === updatedRecipe.dishName)) {
        await saveRecipeToDB(updatedRecipe, currentUser.id);
        const refreshedList = await getSavedRecipesFromDB(currentUser.id);
        setSavedRecipes(refreshedList);
      }
    } catch (e: any) {
      console.error("Video generation failed", e);
      const errorMessage = e.message || "Failed to generate video. Please try again.";
      
      // Check specifically for the Entity Not Found error to trigger retry
      if (errorMessage.includes("resource was not found") || errorMessage.includes("entity was not found")) {
         if (window.aistudio && window.aistudio.openSelectKey) {
             setVideoError("Refreshing authentication...");
             try {
                // Explicitly prompt user to select key again as per guidelines
                await window.aistudio.openSelectKey();
                setVideoError("Authentication refreshed. Please click 'Generate Chef's Reel' again.");
             } catch (keyErr) {
                setVideoError("Authentication failed. Video generation requires a paid API key.");
             }
         } else {
             setVideoError(errorMessage);
         }
      } else {
         setVideoError(errorMessage);
      }
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setRecipeData(null);
    setImagePreview(null);
    setUserQuery(null);
    setError(null);
    setVideoError(null);
    setIsGeneratingVideo(false);
  };

  const toggleSaveRecipe = async (recipe: RecipeData) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const existing = savedRecipes.find(r => r.dishName === recipe.dishName);
    
    try {
      if (existing && existing.id) {
        // Remove
        await deleteRecipeFromDB(existing.id);
      } else {
        // Add - Ensure it has an ID
        const newRecipe = { ...recipe, id: recipe.id || Date.now().toString() };
        await saveRecipeToDB(newRecipe, currentUser.id);
      }
      // Refresh list
      const refreshedList = await getSavedRecipesFromDB(currentUser.id);
      setSavedRecipes(refreshedList);
    } catch (e) {
      console.error("Failed to toggle save", e);
      alert("Failed to update cookbook. Please try again.");
    }
  };

  // New Handler for Rating/Notes Updates
  const handleUpdateRecipe = async (updatedRecipe: RecipeData) => {
    setRecipeData(updatedRecipe);

    // If the recipe is saved and we have a user, persist the update to DB
    if (currentUser) {
      const existing = savedRecipes.find(r => r.dishName === updatedRecipe.dishName);
      if (existing) {
        // Preserve the ID from the database record to ensure update (not insert)
        const recordToSave = { ...updatedRecipe, id: existing.id };
        try {
          await saveRecipeToDB(recordToSave, currentUser.id);
          const refreshedList = await getSavedRecipesFromDB(currentUser.id);
          setSavedRecipes(refreshedList);
        } catch (e) {
          console.error("Failed to save rating", e);
        }
      }
    }
  };

  const isRecipeSaved = (recipe: RecipeData | null) => {
    if (!recipe) return false;
    return savedRecipes.some(r => r.dishName === recipe.dishName);
  };

  const handleDeleteSaved = async (recipe: RecipeData) => {
    if (recipe.id) {
      await deleteRecipeFromDB(recipe.id);
      if (currentUser) {
        const refreshedList = await getSavedRecipesFromDB(currentUser.id);
        setSavedRecipes(refreshedList);
      }
    }
  };

  const handleViewSaved = (recipe: RecipeData) => {
    setRecipeData(recipe);
    // When viewing from saved list, we don't usually have the original image context
    setImagePreview(null);
    setUserQuery(null); 
    setVideoError(null);
    setAppState(AppState.RESULT);
  };

  const handleUpdateKey = () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      window.aistudio.openSelectKey();
    }
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setAppState(AppState.IDLE);
  };

  const handleOpenCookbook = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setAppState(AppState.SAVED_LIST);
  };

  return (
    <div className="min-h-screen font-sans text-africa-earth flex flex-col relative overflow-hidden bg-[#FDFBF7]">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-100 to-transparent -z-10"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-africa-gold/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-40 -left-20 w-72 h-72 bg-africa-green/10 rounded-full blur-3xl -z-10"></div>

      {appState === AppState.ANALYZING && <LoadingOverlay />}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
        />
      )}

      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-africa-earth text-white text-center py-2 px-4 text-sm font-semibold flex items-center justify-center animate-fade-in shadow-md relative z-50">
          <WifiOff size={16} className="mr-2" />
          <span>You are currently offline. Using saved recipes (My Cookbook).</span>
        </div>
      )}

      <header className="p-6 md:p-10 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleReset}>
          <div className="bg-africa-accent p-2 rounded-xl text-white transition-transform group-hover:rotate-12">
            <ChefHat size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-africa-earth">
              Foodstagram <span className="text-africa-accent">Africa</span>
            </h1>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Digital Kitchen</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenCookbook}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold transition-all ${
              appState === AppState.SAVED_LIST 
                ? 'bg-africa-earth text-white shadow-lg' 
                : 'bg-white text-africa-earth shadow-sm hover:shadow-md hover:bg-orange-50'
            }`}
          >
            <BookOpen size={18} />
            <span className="hidden sm:inline">My Collection {currentUser ? `(${savedRecipes.length})` : ''}</span>
          </button>

          {currentUser ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-2.5 rounded-full bg-white text-africa-accent border border-africa-accent/20 hover:bg-orange-50 transition-all">
                <UserIcon size={18} />
                <span className="hidden sm:inline text-sm font-bold">{currentUser.name.split(' ')[0]}</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transform scale-95 opacity-0 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 transition-all z-50 origin-top-right">
                <div className="p-4 border-b border-gray-50">
                  <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center"
                >
                  <LogOut size={14} className="mr-2" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full font-bold bg-africa-accent text-white shadow-md hover:bg-orange-600 transition-all"
            >
              <UserIcon size={18} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 w-full">
        {appState === AppState.IDLE && (
          <div className="w-full max-w-4xl mx-auto text-center space-y-12 animate-fade-in-up">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-africa-earth leading-tight">
                Elevate Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-africa-accent to-africa-clay">
                  Culinary Heritage
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Expert AI analysis for authentic African and Caribbean cuisine. 
                Upload a photo, share a reel, or ask the Chef for precise regional recipes.
              </p>
            </div>
            
            <div className={isOffline ? 'opacity-50 pointer-events-none' : ''}>
              <RecipeInput onInputSubmit={handleInputSubmit} />
            </div>
            
            <div className="flex justify-center space-x-8 text-gray-400 grayscale opacity-60">
              {/* Decorative placeholders for trust badges/partners */}
              <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
              <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        )}

        {appState === AppState.SAVED_LIST && (
           <SavedRecipesList 
              recipes={savedRecipes}
              onSelectRecipe={handleViewSaved}
              onDeleteRecipe={handleDeleteSaved}
              onBack={handleReset}
           />
        )}

        {appState === AppState.RESULT && recipeData && (
          <div className="w-full animate-fade-in">
            {/* Context Header shown only if we have a context (image or query) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center space-x-4 px-4">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Uploaded Dish" 
                  className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-white"
                />
              ) : (
                <div className={`w-24 h-24 rounded-xl flex items-center justify-center border-2 border-white shadow-md p-2 text-center ${userQuery === "Chef's Daily Special" ? 'bg-gradient-to-br from-africa-gold to-africa-accent text-white' : 'bg-africa-accent/10 text-africa-accent'}`}>
                  {userQuery === "Chef's Daily Special" ? <Sparkles size={32} /> : <MessageSquare size={32} />}
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-bold text-africa-accent uppercase">
                  {userQuery ? 'Chef\'s Analysis' : 'Dish Identified'}
                </p>
                <h2 className="text-2xl font-serif font-bold truncate">
                  {userQuery ? (
                    <span className="text-gray-600 italic font-sans text-lg">"{userQuery.length > 50 ? userQuery.substring(0, 50) + '...' : userQuery}"</span>
                  ) : "Authentic Recipe Generated"}
                </h2>
              </div>
            </div>

            <RecipeDisplay 
              data={recipeData} 
              onReset={handleReset}
              onSave={toggleSaveRecipe}
              onUpdate={handleUpdateRecipe}
              onGenerateVideo={handleGenerateVideo}
              onExploreRelated={handleExploreRelated}
              isSaved={isRecipeSaved(recipeData)}
              isGeneratingVideo={isGeneratingVideo}
              videoError={videoError}
            />
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="text-center max-w-md mx-auto p-8 bg-red-50 rounded-3xl border border-red-100 animate-fade-in">
             <div className="text-red-500 mb-4 flex justify-center">
               <ChefHat size={48} className="transform rotate-12"/>
             </div>
             <h3 className="text-xl font-bold text-red-800 mb-2">Service Interruption</h3>
             <p className="text-red-600 mb-6">{error}</p>
             <button 
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition"
              >
                Try Again
              </button>
          </div>
        )}
      </main>

      <footer className="p-6 text-center text-gray-400 text-sm flex flex-col gap-2 items-center">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart size={14} className="text-africa-accent fill-current" /> for African Cuisine
        </p>
        {!isOffline && (
          <button 
            onClick={handleUpdateKey}
            className="flex items-center text-xs opacity-50 hover:opacity-100 hover:text-africa-earth transition"
          >
            <Key size={12} className="mr-1" /> Update API Key
          </button>
        )}
      </footer>
    </div>
  );
};

export default App;