const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import User model
const User = require('./Database/user');

async function clearLockout(email) {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    // Check if account is actually locked
    if (!user.loginAttempts.lockedUntil || user.loginAttempts.lockedUntil <= new Date()) {
      console.log(`ℹ️ Account for ${email} is not currently locked`);
      return;
    }

    // Clear the lockout
    user.loginAttempts.count = 0;
    user.loginAttempts.lockedUntil = null;
    user.loginAttempts.lastAttempt = null;
    await user.save();

    console.log(`✅ Account lockout cleared for ${email}`);
    console.log(`📊 Failed attempts reset to: ${user.loginAttempts.count}`);
    
  } catch (error) {
    console.error('❌ Error clearing lockout:', error.message);
  }
}

async function listLockedAccounts() {
  try {
    const lockedUsers = await User.find({
      'loginAttempts.lockedUntil': { $gt: new Date() }
    });

    if (lockedUsers.length === 0) {
      console.log('ℹ️ No accounts are currently locked');
      return;
    }

    console.log('🔒 Currently locked accounts:');
    lockedUsers.forEach(user => {
      const remainingTime = Math.ceil((user.loginAttempts.lockedUntil - new Date()) / 60000);
      console.log(`📧 ${user.email} - Locked for ${remainingTime} more minutes`);
    });
    
  } catch (error) {
    console.error('❌ Error listing locked accounts:', error.message);
  }
}

async function clearAllLockouts() {
  try {
    const result = await User.updateMany(
      { 'loginAttempts.lockedUntil': { $gt: new Date() } },
      {
        $set: {
          'loginAttempts.count': 0,
          'loginAttempts.lockedUntil': null,
          'loginAttempts.lastAttempt': null
        }
      }
    );

    console.log(`✅ Cleared lockouts for ${result.modifiedCount} accounts`);
    
  } catch (error) {
    console.error('❌ Error clearing all lockouts:', error.message);
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'clear':
      const email = args[1];
      if (!email) {
        console.log('❌ Please provide an email address');
        console.log('Usage: node clear-lockout.js clear <email>');
        process.exit(1);
      }
      await clearLockout(email);
      break;

    case 'list':
      await listLockedAccounts();
      break;

    case 'clear-all':
      await clearAllLockouts();
      break;

    default:
      console.log('🔧 Account Lockout Management Tool');
      console.log('');
      console.log('Usage:');
      console.log('  node clear-lockout.js clear <email>     - Clear lockout for specific user');
      console.log('  node clear-lockout.js list              - List all locked accounts');
      console.log('  node clear-lockout.js clear-all         - Clear all account lockouts');
      console.log('');
      console.log('Examples:');
      console.log('  node clear-lockout.js clear test@example.com');
      console.log('  node clear-lockout.js list');
      console.log('  node clear-lockout.js clear-all');
      break;
  }

  // Close database connection
  await mongoose.connection.close();
  console.log('Database connection closed');
}

// Run the script
main().catch(console.error); 