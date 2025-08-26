// Demo Users Setup for Evaluation
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export const createDemoUsers = async () => {
  const demoUsers = [
    {
      email: 'admin@supermall.com',
      password: 'Admin123!',
      displayName: 'Admin User',
      role: 'admin'
    },
    {
      email: 'user@supermall.com',
      password: 'User123!',
      displayName: 'Demo User',
      role: 'user'
    },
    {
      email: 'shopowner@supermall.com',
      password: 'Shop123!',
      displayName: 'Shop Owner',
      role: 'user'
    }
  ];

  for (const user of demoUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        user.email, 
        user.password
      );
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Created demo user: ${user.email}`);
    } catch {
      console.log(`Demo user already exists: ${user.email}`);
    }
  }
};
