const { createUniversalAdmin } = require('../src/lib/firebase/auth');

async function setup() {
  console.log('Setting up universal admin account...');
  const success = await createUniversalAdmin();
  if (success) {
    console.log('Universal admin account setup complete!');
    console.log('You can now login with:');
    console.log('Email: admin@brainquest.africa');
    console.log('Password: BrainQuest@2024');
  } else {
    console.error('Failed to setup universal admin account');
  }
  process.exit(0);
}

setup();
