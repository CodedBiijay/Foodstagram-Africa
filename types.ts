
export interface SpecialIngredient {
  name: string;
  explanation: string;
  substitute: string;
}

export interface FlavorProfile {
  spicy: number;
  sweet: number;
  savory: number;
  sour: number;
  bitter: number;
}

export interface RelatedDish {
  dishName: string;
  origin: string;
  connection: string;
}

export interface RecipeData {
  id?: string;
  dishName: string;
  origin: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  specialIngredients: SpecialIngredient[];
  flavorProfile: FlavorProfile;
  cookingTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  videoUri?: string;
  relatedDishes?: RelatedDish[];
  userRating?: number;
  userNotes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  SAVED_LIST = 'SAVED_LIST'
}

// Declaration for the AI Studio window extension
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
