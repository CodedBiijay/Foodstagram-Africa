import { User } from '../types';

const USERS_KEY = 'foodstagram_users';
const SESSION_KEY = 'foodstagram_session';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const registerUser = async (name: string, email: string): Promise<User> => {
  await delay(800); // Fake delay

  const usersJson = localStorage.getItem(USERS_KEY);
  const users: User[] = usersJson ? JSON.parse(usersJson) : [];

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    createdAt: Date.now()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  
  return newUser;
};

export const loginUser = async (email: string): Promise<User> => {
  await delay(800);

  const usersJson = localStorage.getItem(USERS_KEY);
  const users: User[] = usersJson ? JSON.parse(usersJson) : [];

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    throw new Error("No account found with this email.");
  }

  // In a real app, we would check password here. 
  // For this mock, email is enough.
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
};