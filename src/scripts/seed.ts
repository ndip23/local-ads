import 'dotenv/config';
import { connectToMongo, User, Wallet, AdvertiserProfile, PublisherProfile } from '../db/mongo';
import { hashPassword, createUser } from '../lib/auth';

async function seed() {
  console.log('🌱 Seeding MongoDB (users only)...');

  try {
    await connectToMongo();

    // Admin
    const admin = await User.findOne({ email: 'admin@localadnetwork.com' });
    if (!admin) {
      await createUser('admin@localadnetwork.com', 'admin123', 'admin', 'Admin', 'User');
      console.log('✅ Admin user created: admin@localadnetwork.com');
    } else {
      console.log('ℹ️ Admin already exists');
    }

    // Advertiser
    const advertiser = await User.findOne({ email: 'advertiser@example.com' });
    if (!advertiser) {
      await createUser('advertiser@example.com', 'advertiser123', 'advertiser', 'John', 'Advertiser');
      console.log('✅ Advertiser user created: advertiser@example.com');
    } else {
      console.log('ℹ️ Advertiser already exists');
    }

    // Publisher
    const publisher = await User.findOne({ email: 'publisher@example.com' });
    if (!publisher) {
      await createUser('publisher@example.com', 'publisher123', 'publisher', 'Jane', 'Publisher');
      console.log('✅ Publisher user created: publisher@example.com');
    } else {
      console.log('ℹ️ Publisher already exists');
    }

    console.log('\n🎉 Seeding complete. Demo accounts:');
    console.log('   Admin: admin@localadnetwork.com / admin123');
    console.log('   Advertiser: advertiser@example.com / advertiser123');
    console.log('   Publisher: publisher@example.com / publisher123');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
