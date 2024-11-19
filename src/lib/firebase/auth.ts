const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { firebaseApp } = require('./config');

const auth = getAuth(firebaseApp);

// Function to create the universal admin account
async function createUniversalAdmin() {
  try {
    const email = 'admin@brainquest.africa';
    const password = 'BrainQuest@2024'; // Strong password with mix of characters
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Universal admin account created:', userCredential.user.email);
    return true;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Universal admin account already exists');
      return true;
    }
    console.error('Error creating universal admin:', error);
    return false;
  }
}

module.exports = {
  auth,
  createUniversalAdmin
};
