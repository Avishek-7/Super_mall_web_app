// Mock Firebase for Demo/Evaluation Purposes
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

// Mock Firebase configuration for demo purposes
export const mockFirebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "super-mall-demo.firebaseapp.com",
  projectId: "super-mall-demo",
  storageBucket: "super-mall-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
};

// Mock authentication responses
export const mockAuth = {
  currentUser: {
    uid: "demo-user-123",
    email: "demo@example.com",
    displayName: "Demo User",
  },
  signInWithEmailAndPassword: () => Promise.resolve({ user: mockAuth.currentUser }),
  createUserWithEmailAndPassword: () => Promise.resolve({ user: mockAuth.currentUser }),
  signOut: () => Promise.resolve(),
};

// Mock Firestore data
export const mockData = {
  shops: [
    {
      id: "1",
      name: "Tech Galaxy Store",
      category: "Electronics & Mobile",
      floor: "Ground Floor",
      address: "Shop G-15, Tech Wing",
      phone: "+1-555-0123",
      email: "contact@techgalaxy.com",
      ownerId: "demo-user-123",
      isActive: true,
    },
    // Add more mock shops...
  ],
  offers: [
    {
      id: "1",
      title: "50% Off Electronics",
      description: "Great deals on all electronics",
      discount: 50,
      shopId: "1",
      shopName: "Tech Galaxy Store",
      validFrom: new Date(),
      validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    // Add more mock offers...
  ],
};
