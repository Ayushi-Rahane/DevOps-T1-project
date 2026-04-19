const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const ATLAS_URI = 'mongodb+srv://ayushirahane2021_db_user:RKleVGaYPhRF3T7g@cluster0.5jqbeob.mongodb.net/issuesphere_db?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  const client = new MongoClient(ATLAS_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db('issuesphere_db');

    // ─── Drop existing collections for a clean seed ───
    const existing = (await db.listCollections().toArray()).map(c => c.name);
    for (const col of ['users', 'complaints', 'notifications']) {
      if (existing.includes(col)) {
        await db.collection(col).drop();
        console.log(`🗑️  Dropped collection: ${col}`);
      }
    }

    // ──────────────────────────────────────────────────
    // 1. USERS collection
    // ──────────────────────────────────────────────────
    const usersCol = db.collection('users');

    // Create unique indexes
    await usersCol.createIndex({ email: 1 }, { unique: true });
    await usersCol.createIndex({ ucn: 1 }, { unique: true });

    const passwordHash = await bcrypt.hash('Password@123', 10);
    const adminHash    = await bcrypt.hash('Admin@123', 10);

    const now = new Date();
    const users = await usersCol.insertMany([
      {
        fullName: 'Alice Student',
        ucn: 'UCN2021001',
        degree: 'B.Tech',
        year: '3rd',
        branch: 'Computer Science',
        phone: '9876543210',
        email: 'alice@campus.com',
        password: passwordHash,
        role: 'student',
        createdAt: now,
        updatedAt: now,
      },
      {
        fullName: 'Bob Student',
        ucn: 'UCN2021002',
        degree: 'B.Tech',
        year: '2nd',
        branch: 'Electronics',
        phone: '9876543211',
        email: 'bob@campus.com',
        password: passwordHash,
        role: 'student',
        createdAt: now,
        updatedAt: now,
      },
      {
        fullName: 'Admin User',
        ucn: 'ADMIN001',
        degree: '',
        year: '',
        branch: '',
        phone: '9000000000',
        email: 'admin@campus.com',
        password: adminHash,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      }
    ]);
    console.log(`👤 Inserted ${users.insertedCount} users`);

    const aliceId = users.insertedIds[0];
    const bobId   = users.insertedIds[1];

    // ──────────────────────────────────────────────────
    // 2. COMPLAINTS collection
    // ──────────────────────────────────────────────────
    const complaintsCol = db.collection('complaints');
    await complaintsCol.createIndex({ userId: 1 });
    await complaintsCol.createIndex({ status: 1 });

    const complaints = await complaintsCol.insertMany([
      {
        subject: 'Broken projector in Room 204',
        description: 'The projector in Room 204 has not been working for 2 weeks. Classes are being affected.',
        category: 'Infrastructure',
        visibility: 'Public',
        status: 'Pending',
        statusHistory: [{ status: 'Pending', changedAt: now }],
        userId: aliceId,
        createdAt: now,
        updatedAt: now,
      },
      {
        subject: 'Canteen food quality has decreased',
        description: 'The food served in the canteen is unhygienic and portions are smaller than before.',
        category: 'Canteen',
        visibility: 'Public',
        status: 'In Progress',
        statusHistory: [
          { status: 'Pending', changedAt: now },
          { status: 'In Progress', changedAt: now }
        ],
        userId: bobId,
        createdAt: now,
        updatedAt: now,
      },
      {
        subject: 'Wi-Fi not working in hostel block C',
        description: 'The internet connection in hostel block C has been intermittent for the past week.',
        category: 'IT / Network',
        visibility: 'Private',
        status: 'Resolved',
        statusHistory: [
          { status: 'Pending', changedAt: now },
          { status: 'In Progress', changedAt: now },
          { status: 'Resolved', changedAt: now }
        ],
        userId: aliceId,
        createdAt: now,
        updatedAt: now,
      }
    ]);
    console.log(`📋 Inserted ${complaints.insertedCount} complaints`);

    const complaint1Id = complaints.insertedIds[0];
    const complaint2Id = complaints.insertedIds[1];

    // ──────────────────────────────────────────────────
    // 3. NOTIFICATIONS collection
    // ──────────────────────────────────────────────────
    const notificationsCol = db.collection('notifications');
    await notificationsCol.createIndex({ userId: 1 });
    await notificationsCol.createIndex({ forRole: 1 });
    await notificationsCol.createIndex({ isRead: 1 });

    const notifications = await notificationsCol.insertMany([
      {
        userId: null,
        forRole: 'admin',
        message: 'New complaint submitted: Broken projector in Room 204',
        type: 'new_complaint',
        complaintId: complaint1Id.toString(),
        complaintTitle: 'Broken projector in Room 204',
        isRead: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: null,
        forRole: 'admin',
        message: 'New complaint submitted: Canteen food quality has decreased',
        type: 'new_complaint',
        complaintId: complaint2Id.toString(),
        complaintTitle: 'Canteen food quality has decreased',
        isRead: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        userId: aliceId,
        forRole: 'student',
        message: 'Your complaint "Wi-Fi not working in hostel block C" has been marked Resolved.',
        type: 'status_change',
        complaintId: complaints.insertedIds[2].toString(),
        complaintTitle: 'Wi-Fi not working in hostel block C',
        isRead: false,
        createdAt: now,
        updatedAt: now,
      }
    ]);
    console.log(`🔔 Inserted ${notifications.insertedCount} notifications`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📌 Sample Login Credentials:');
    console.log('  Student → email: alice@campus.com  | password: Password@123');
    console.log('  Student → email: bob@campus.com    | password: Password@123');
    console.log('  Admin   → email: admin@campus.com  | password: Admin@123');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await client.close();
  }
}

seed();
