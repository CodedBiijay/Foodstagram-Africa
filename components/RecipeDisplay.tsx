
import React, { useState, useEffect, useRef } from 'react';
import { RecipeData, RelatedDish } from '../types';
import { Clock, ChefHat, MapPin, Globe, Leaf, Heart, ArrowLeft, Video, Film, AlertCircle, Share2, Check, Timer, Play, Pause, RotateCcw, Utensils, Star, Edit3, Save, CheckSquare, Square } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface RecipeDisplayProps {
  data: RecipeData;
  onReset: () => void;
  onSave?: (recipe: RecipeData) => void;
  onUpdate?: (recipe: RecipeData) => void;
  onGenerateVideo: () => void;
  onExploreRelated?: (dishName: string) => void;
  isSaved?: boolean;
  isGeneratingVideo?: boolean;
  videoError?: string | null;
}

// Helper to parse duration string into seconds
const parseDuration = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  const normalized = timeStr.toLowerCase();
  let totalSeconds = 0;
  
  // Extract hours
  const hoursMatch = normalized.match(/(\d+)\s*(?:h|hr|hour)/);
  if (hoursMatch) {
    totalSeconds += parseInt(hoursMatch[1], 10) * 3600;
  }
  
  // Extract minutes
  // This regex looks for digits immediately followed by 'm' or 'min'
  const minutesMatch = normalized.match(/(\d+)\s*(?:m|min)/);
  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1], 10) * 60;
  }
  
  // Fallback: if specific units aren't found but there's a number, assume minutes
  // e.g. "45" -> 45 minutes
  if (!hoursMatch && !minutesMatch) {
      const numberMatch = normalized.match(/(\d+)/);
      if (numberMatch) totalSeconds += parseInt(numberMatch[1], 10) * 60;
  }

  return totalSeconds;
};

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ 
  data, 
  onReset, 
  onSave, 
  onUpdate,
  onGenerateVideo,
  onExploreRelated,
  isSaved = false,
  isGeneratingVideo = false,
  videoError
}) => {
  const [isShared, setIsShared] = useState(false);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // Timer State
  const [totalTime, setTotalTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Rating & Notes State
  const [userRating, setUserRating] = useState(data.userRating || 0);
  const [userNotes, setUserNotes] = useState(data.userNotes || '');
  const [isNotesFocused, setIsNotesFocused] = useState(false);

  // Ingredients Checkbox State
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  const chartData = [
    { subject: 'Spicy', A: data.flavorProfile.spicy, fullMark: 10 },
    { subject: 'Sweet', A: data.flavorProfile.sweet, fullMark: 10 },
    { subject: 'Savory', A: data.flavorProfile.savory, fullMark: 10 },
    { subject: 'Sour', A: data.flavorProfile.sour, fullMark: 10 },
    { subject: 'Bitter', A: data.flavorProfile.bitter, fullMark: 10 },
  ];

  // Initialize timer and states when recipe changes
  useEffect(() => {
    const seconds = parseDuration(data.cookingTime);
    setTotalTime(seconds);
    setTimeLeft(seconds);
    setIsTimerActive(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    // Reset local rating state if data changes drastically (new recipe id)
    setUserRating(data.userRating || 0);
    setUserNotes(data.userNotes || '');
    
    // Reset checked ingredients
    setCheckedIngredients(new Set());
  }, [data.id, data.cookingTime, data.userRating, data.userNotes]);

  // Handle Timer Interval
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerActive, timeLeft]);

  // Effect to securely fetch the video when a URI is present
  useEffect(() => {
    let active = true;

    const fetchVideoData = async () => {
      if (!data.videoUri) {
        setVideoBlobUrl(null);
        return;
      }

      setIsVideoLoading(true);
      setPlayerError(null);

      try {
        // Determine correct separator for query params
        const separator = data.videoUri.includes('?') ? '&' : '?';
        const url = `${data.videoUri}${separator}key=${process.env.API_KEY}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to load video: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        
        if (active) {
          const objectUrl = URL.createObjectURL(blob);
          setVideoBlobUrl(objectUrl);
        }
      } catch (err: any) {
        console.error("Video fetch error:", err);
        if (active) {
          setPlayerError("Unable to load the video file. The link may have expired or is inaccessible.");
        }
      } finally {
        if (active) {
          setIsVideoLoading(false);
        }
      }
    };

    fetchVideoData();

    return () => {
      active = false;
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [data.videoUri]);

  const handleShare = async () => {
    const shareText = `
🍳 ${data.dishName} (${data.origin})
"${data.description}"

⏳ Time: ${data.cookingTime} | 👨‍🍳 Difficulty: ${data.difficulty}

🛒 Ingredients:
${data.ingredients.map(i => `- ${i}`).join('\n')}

📝 Instructions:
${data.instructions.map((s, i) => `${i+1}. ${s}`).join('\n')}

Discover authentic African cuisine with Foodstagram Africa!
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Recipe: ${data.dishName}`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share dismissed or failed', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate({
        ...data,
        userRating,
        userNotes
      });
    }
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    // Auto-update on rating change
    if (onUpdate) {
      onUpdate({
        ...data,
        userRating: rating,
        userNotes // preserve current notes
      });
    }
  };

  const toggleIngredient = (index: number) => {
    const next = new Set(checkedIngredients);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedIngredients(next);
  };

  const toggleTimer = () => setIsTimerActive(!isTimerActive);
  const resetTimer = () => {
    setIsTimerActive(false);
    setTimeLeft(totalTime);
  };

  const ingredientsProgress = `${checkedIngredients.size}/${data.ingredients.length}`;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden my-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-africa-accent text-white p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <ChefHat size={300} />
        </div>
        
        {/* Navigation & Actions */}
        <div className="relative z-20 flex justify-between items-start mb-6">
          <button 
            onClick={onReset}
            className="flex items-center text-white/80 hover:text-white transition font-semibold bg-black/10 px-3 py-1.5 rounded-full hover:bg-black/20"
          >
            <ArrowLeft size={18} className="mr-1" /> Back
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 rounded-full font-bold shadow-lg transition transform hover:scale-105 active:scale-95 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              {isShared ? (
                <>
                  <Check size={18} className="mr-2" /> Copied
                </>
              ) : (
                <>
                  <Share2 size={18} className="mr-2" /> Share
                </>
              )}
            </button>

            {onSave && (
              <button 
                onClick={() => onSave(data)}
                className={`flex items-center px-4 py-2 rounded-full font-bold shadow-lg transition transform hover:scale-105 active:scale-95 ${
                  isSaved 
                    ? 'bg-white text-africa-accent' 
                    : 'bg-black/20 text-white hover:bg-black/30'
                }`}
              >
                <Heart 
                  size={18} 
                  className={`mr-2 ${isSaved ? 'fill-current' : ''}`} 
                />
                {isSaved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-africa-gold font-bold uppercase tracking-wider text-sm mb-2">
            <MapPin size={16} />
            <span>{data.origin}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">{data.dishName}</h1>
          <p className="text-lg opacity-90 italic max-w-2xl font-light leading-relaxed">"{data.description}"</p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold">
              <Clock size={16} className="mr-2" />
              {data.cookingTime}
            </div>
            
            <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold">
              <ChefHat size={16} className="mr-2" />
              {data.difficulty}
            </div>

            {/* Interactive Timer */}
            {totalTime > 0 && (
              <div className={`flex items-center rounded-full px-1 py-1 pr-4 text-sm font-semibold border transition-colors duration-300 ${isTimerActive ? 'bg-white text-africa-accent border-white' : 'bg-black/20 border-white/30 text-white'}`}>
                <div className={`p-1.5 rounded-full mr-3 ${isTimerActive ? 'bg-africa-accent text-white' : 'bg-white/20'}`}>
                  <Timer size={16} className={isTimerActive ? 'animate-pulse' : ''}/>
                </div>
                <span className="tabular-nums font-mono text-base mr-3 tracking-widest">{formatTime(timeLeft)}</span>
                <div className="flex space-x-1">
                  <button 
                    onClick={toggleTimer} 
                    className={`p-1 rounded-full hover:bg-black/10 transition ${isTimerActive ? 'text-africa-accent hover:text-africa-earth' : 'text-white'}`}
                    title={isTimerActive ? "Pause" : "Start"}
                  >
                    {isTimerActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                  </button>
                  <button 
                    onClick={resetTimer} 
                    className={`p-1 rounded-full hover:bg-black/10 transition ${isTimerActive ? 'text-africa-accent hover:text-africa-earth' : 'text-white'}`}
                    title="Reset"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="bg-africa-sand/20 border-b border-africa-sand/30 p-4">
        {data.videoUri ? (
          <div className="w-full max-w-2xl mx-auto overflow-hidden rounded-xl shadow-lg bg-black relative min-h-[300px] flex flex-col">
             {isVideoLoading && (
               <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 text-white">
                 <div className="w-10 h-10 border-4 border-africa-accent border-t-transparent rounded-full animate-spin mb-3"></div>
                 <p className="text-sm font-semibold">Loading your masterpiece...</p>
               </div>
             )}
             
             {playerError ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-900 text-white">
                  <AlertCircle size={48} className="text-red-500 mb-4" />
                  <p className="text-lg font-bold mb-2">Video Unavailable</p>
                  <p className="text-gray-400 text-sm max-w-xs">{playerError}</p>
                </div>
             ) : (
                videoBlobUrl && (
                  <video 
                    src={videoBlobUrl} 
                    controls 
                    className="w-full h-auto aspect-video"
                    autoPlay
                    muted
                    loop
                  />
                )
             )}

             <div className="p-3 bg-white flex items-center justify-between mt-auto">
               <span className="font-bold text-africa-earth flex items-center"><Film size={18} className="mr-2 text-africa-accent"/> Chef's Reel</span>
               <span className="text-xs text-gray-500 uppercase">AI Generated</span>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            {videoError && (
              <div className="flex items-center text-africa-clay bg-red-50 px-5 py-3 rounded-xl border border-red-100 mb-6 max-w-md text-center shadow-sm animate-fade-in">
                <AlertCircle size={20} className="mr-3 flex-shrink-0" />
                <div className="flex flex-col items-start text-left">
                   <span className="text-sm font-bold">Video Generation Issue</span>
                   <span className="text-xs opacity-90 mt-0.5">{videoError}</span>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center">
              <button 
                onClick={onGenerateVideo}
                disabled={isGeneratingVideo}
                className={`
                  relative overflow-hidden flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300
                  ${isGeneratingVideo 
                    ? 'bg-africa-sand/30 text-gray-500 cursor-not-allowed shadow-none border border-gray-200' 
                    : 'bg-white border-2 border-africa-accent text-africa-accent hover:bg-africa-accent hover:text-white shadow-md hover:shadow-lg hover:-translate-y-1'
                  }
                `}
              >
                {isGeneratingVideo ? (
                  <>
                    <div className="absolute inset-0 bg-white/50 w-full h-full animate-pulse"></div>
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3 relative z-10"></div>
                    <span className="relative z-10">Filming your dish...</span>
                  </>
                ) : (
                  <>
                    <Video size={24} className="mr-3" />
                    <span>{videoError ? 'Try Again' : 'Generate Chef\'s Reel'}</span>
                  </>
                )}
              </button>
              
              {isGeneratingVideo && (
                 <p className="text-xs text-gray-500 mt-4 animate-pulse font-medium">
                   Producing culinary preview (approx. 1 min)...
                 </p>
              )}
              
              {!isGeneratingVideo && !videoError && (
                 <p className="text-xs text-gray-400 mt-4 max-w-xs text-center">
                   Visualize this dish with an AI-generated video preview by Veo.
                 </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Ingredients & Flavor */}
        <div className="lg:col-span-1 space-y-8">
          <div>
            <div className="flex items-center justify-between border-b-2 border-africa-gold mb-4 pb-1">
              <h3 className="text-2xl font-serif font-bold text-africa-earth">Ingredients</h3>
              {data.ingredients.length > 0 && (
                <span className="text-xs font-bold text-africa-accent bg-orange-50 px-2 py-1 rounded-full">
                  {ingredientsProgress}
                </span>
              )}
            </div>
            <ul className="space-y-3">
              {data.ingredients.map((ing, idx) => {
                const isChecked = checkedIngredients.has(idx);
                return (
                  <li 
                    key={idx} 
                    onClick={() => toggleIngredient(idx)}
                    className={`flex items-start p-2 rounded-lg transition-all duration-200 cursor-pointer select-none group ${isChecked ? 'bg-gray-50' : 'hover:bg-orange-50'}`}
                  >
                    <div className={`mt-0.5 mr-3 flex-shrink-0 transition-colors duration-300 ${isChecked ? 'text-africa-green' : 'text-gray-300 group-hover:text-africa-accent'}`}>
                       {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                    <span className={`leading-snug transition-all duration-300 ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {ing}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-africa-sand/30 p-4 rounded-xl">
             <h3 className="text-lg font-serif font-bold text-africa-earth mb-2 flex items-center">
              <Leaf className="mr-2 text-africa-green" size={20}/> Flavor Profile
             </h3>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                   <PolarGrid />
                   <PolarAngleAxis dataKey="subject" tick={{ fill: '#4E4B42', fontSize: 12 }} />
                   <PolarRadiusAxis angle={30} domain={[0, 10]} hide />
                   <Radar
                     name="Intensity"
                     dataKey="A"
                     stroke="#D95D39"
                     fill="#D95D39"
                     fillOpacity={0.5}
                   />
                   <Tooltip />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Right Column: Instructions & Special Items */}
        <div className="lg:col-span-2 space-y-8">
          
          {data.specialIngredients.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h3 className="text-xl font-serif font-bold text-yellow-800 mb-4 flex items-center">
                <Globe className="mr-2" size={24}/> Pantry Notes: Key Ingredients
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.specialIngredients.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-yellow-100">
                    <p className="font-bold text-africa-earth text-lg mb-1">{item.name}</p>
                    <p className="text-sm text-gray-600 mb-2">{item.explanation}</p>
                    <p className="text-xs font-semibold text-africa-accent uppercase tracking-wide">
                      Diaspora Substitute: <span className="normal-case text-gray-800">{item.substitute}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-2xl font-serif font-bold text-africa-earth mb-6 border-b-2 border-africa-gold inline-block pb-1">Instructions</h3>
            <div className="space-y-6">
              {data.instructions.map((step, idx) => (
                <div key={idx} className="flex">
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-africa-earth text-africa-gold font-bold mr-4 mt-1">
                    {idx + 1}
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Chef's Log - Rating & Notes */}
      <div className="border-t border-gray-100 p-8 bg-africa-sand/10">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-serif font-bold text-africa-earth mb-6 flex items-center">
            <Edit3 size={24} className="mr-3 text-africa-clay" /> Chef's Log
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Rating */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Rate this Recipe</p>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    onClick={() => handleRating(star)}
                    className="focus:outline-none transform transition-transform hover:scale-110"
                  >
                    <Star 
                      size={32} 
                      className={`${star <= userRating ? 'fill-africa-gold text-africa-gold' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 italic">
                {userRating > 0 ? "Thanks for your rating!" : "How did it turn out?"}
              </p>
            </div>

            {/* Notes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Cooking Notes</p>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                onFocus={() => setIsNotesFocused(true)}
                onBlur={() => setIsNotesFocused(false)}
                placeholder="Add your personal notes (e.g., 'Used less pepper', 'Marinated overnight')..."
                className="w-full h-32 p-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:border-africa-accent focus:bg-white focus:ring-0 transition-colors resize-none text-sm"
              />
              {(userNotes !== data.userNotes) && (
                 <button 
                   onClick={handleUpdate}
                   className="absolute bottom-4 right-4 bg-africa-earth text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition animate-fade-in"
                   title="Save Notes"
                 >
                   <Save size={16} />
                 </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Culinary Connections */}
      {data.relatedDishes && data.relatedDishes.length > 0 && (
        <div className="bg-africa-earth text-white p-8">
          <h3 className="text-2xl font-serif font-bold mb-6 flex items-center">
            <Utensils size={24} className="mr-3 text-africa-gold" /> Culinary Connections
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {data.relatedDishes.map((dish, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onExploreRelated && onExploreRelated(dish.dishName)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-4 rounded-xl cursor-pointer transition transform hover:-translate-y-1 border border-white/5"
                >
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-lg">{dish.dishName}</span>
                     <span className="text-xs bg-africa-gold text-africa-earth px-2 py-0.5 rounded-full font-bold">{dish.origin}</span>
                   </div>
                   <p className="text-sm text-gray-300 italic">"{dish.connection}"</p>
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
         <button 
           onClick={onReset}
           className="text-africa-earth font-semibold hover:text-africa-accent transition flex items-center"
         >
           <ArrowLeft size={16} className="mr-2" /> Explore Another Dish
         </button>
      </div>
    </div>
  );
};

export default RecipeDisplay;
