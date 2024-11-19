import { getAuth, createUserWithEmailAndPassword, Auth } from 'firebase/auth';
import { firebaseApp } from './config';

const auth: Auth = getAuth(firebaseApp);

// Function to create the universal admin account
async function createUniversalAdmin() {
  const email = 'admin@brainquest.africa';
  const password = 'BrainQuest@2024';

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Universal admin created:', userCredential.user);
    return true;
  } catch (error) {
    console.error('Error creating universal admin:', error);
    return false;
  }
}

export {
  auth,
  createUniversalAdmin
};
