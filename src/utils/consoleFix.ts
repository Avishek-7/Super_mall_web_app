/**
 * BROWSER CONSOLE QUICK FIX
 * 
 * Copy and paste this code into your browser's developer console (F12 → Console tab)
 * This will immediately fix your user profile to enable dashboard access
 */

// Quick fix function that can be run directly in browser console
async function quickFixMyProfile() {
  try {
    // Import Firebase functions
    const { doc, updateDoc } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    
    const userId = 'eyj5laNjCKZD0g1Qk92mvsUYVW62';
    const userDocRef = doc(db, 'users', userId);
    
    const updates = {
      businessType: 'service',
      businessName: 'Avishek Services',
      role: 'user',
      updatedAt: new Date()
    };
    
    await updateDoc(userDocRef, updates);
    
    console.log('✅ Profile fixed successfully!');
    console.log('📋 Updates applied:', updates);
    console.log('🔄 Please refresh the page or log out and log back in to access the dashboard.');
    
    // Show alert to user
    alert('✅ Profile fixed! Please refresh the page to access your dashboard.');
    
    return { success: true, updates };
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    alert('❌ Fix failed. Please try the component button instead.');
    return { success: false, error };
  }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🔧 Quick fix function available: quickFixMyProfile()');
  console.log('💡 Run quickFixMyProfile() to fix your profile');
}

// Export for use
export { quickFixMyProfile };
