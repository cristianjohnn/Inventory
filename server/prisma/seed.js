import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // =============================================
  // Seed Admin User
  // =============================================
  const passwordHash = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@inspireholdings.ph' },
    update: {},
    create: {
      email: 'admin@inspireholdings.ph',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      department: 'IT_DEPARTMENT',
      preferences: {
        emailNotifications: true,
        collapsedSidebar: false,
      },
    },
  });

  console.log(`  👤 Admin user: ${adminUser.email} (password: admin123)`);

  // =============================================
  // Seed Sample Assets
  // =============================================
  const assets = [
    {
      name: 'MacBook Pro 16"',
      category: 'LAPTOP',
      serialNumber: 'MBP-2024-001',
      purchaseDate: new Date('2024-06-15'),
      purchasePrice: 2499,
      salvageValue: 250,
      usefulLifeYears: 4,
      depreciationMethod: 'STRAIGHT_LINE',
      status: 'IN_USE',
      department: 'IT_DEPARTMENT',
      assignedEmployee: 'Juan Dela Cruz',
      location: 'Main Office, Floor 3',
      warrantyExpiry: new Date('2027-06-15'),
      notes: 'M3 Pro chip, 18GB RAM, 512GB SSD',
    },
    {
      name: 'Dell UltraSharp 27" 4K',
      category: 'MONITOR',
      serialNumber: 'DU27-2024-002',
      purchaseDate: new Date('2024-08-01'),
      purchasePrice: 649,
      salvageValue: 50,
      usefulLifeYears: 5,
      depreciationMethod: 'STRAIGHT_LINE',
      status: 'IN_USE',
      department: 'MARKETING',
      assignedEmployee: 'Maria Santos',
      location: 'Main Office, Floor 2',
      warrantyExpiry: new Date('2027-08-01'),
    },
    {
      name: 'HP ProLiant DL380 Gen10',
      category: 'SERVER',
      serialNumber: 'HPG10-2023-003',
      purchaseDate: new Date('2023-01-20'),
      purchasePrice: 12500,
      salvageValue: 1000,
      usefulLifeYears: 7,
      depreciationMethod: 'DOUBLE_DECLINING',
      status: 'IN_USE',
      department: 'IT_DEPARTMENT',
      location: 'Server Room A',
      warrantyExpiry: new Date('2026-01-20'),
      notes: 'Primary database server',
    },
    {
      name: 'iPhone 15 Pro',
      category: 'PHONE',
      serialNumber: 'IP15-2024-004',
      purchaseDate: new Date('2024-10-01'),
      purchasePrice: 1199,
      salvageValue: 200,
      usefulLifeYears: 3,
      depreciationMethod: 'STRAIGHT_LINE',
      status: 'IN_USE',
      department: 'EXECUTIVE',
      assignedEmployee: 'Ricardo Reyes',
      location: 'Executive Office',
    },
    {
      name: 'Epson WorkForce Pro WF-C5890',
      category: 'PRINTER',
      serialNumber: 'EWF-2024-005',
      purchaseDate: new Date('2024-03-15'),
      purchasePrice: 499,
      salvageValue: 30,
      usefulLifeYears: 5,
      depreciationMethod: 'STRAIGHT_LINE',
      status: 'AVAILABLE',
      department: 'ADMIN_DEPARTMENT',
      location: 'Admin Office, Floor 1',
      warrantyExpiry: new Date('2026-03-15'),
    },
    {
      name: 'Cisco Catalyst 9200L-48P',
      category: 'NETWORKING',
      serialNumber: 'CC9200-2023-006',
      purchaseDate: new Date('2023-06-01'),
      purchasePrice: 4200,
      salvageValue: 300,
      usefulLifeYears: 7,
      depreciationMethod: 'DOUBLE_DECLINING',
      status: 'IN_USE',
      department: 'IT_DEPARTMENT',
      location: 'Network Room B',
      notes: '48-port PoE+ managed switch',
    },
    {
      name: 'Logitech MX Master 3S',
      category: 'PERIPHERAL',
      serialNumber: 'LMX-2024-007',
      purchaseDate: new Date('2024-02-10'),
      purchasePrice: 99,
      salvageValue: 5,
      usefulLifeYears: 3,
      depreciationMethod: 'UNITS_OF_PRODUCTION',
      totalUnits: 5000000,
      unitsUsed: 1200000,
      status: 'IN_USE',
      department: 'CORPORATE_DEPARTMENT',
      assignedEmployee: 'Ana Garcia',
      location: 'Main Office, Floor 2',
    },
  ];

  for (const assetData of assets) {
    const idx = assets.indexOf(assetData) + 1;
    const assetTag = `IT-ASSET-${String(idx).padStart(4, '0')}`;

    const existing = await prisma.asset.findUnique({ where: { assetTag } });
    if (existing) {
      console.log(`  ⏭️ Skipped: ${assetTag} — ${assetData.name} (already exists)`);
      continue;
    }

    const asset = await prisma.asset.create({
      data: { ...assetData, assetTag },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        assetId: asset.id,
        action: 'CREATED',
        details: `Asset "${asset.name}" created with tag ${assetTag}`,
        performedBy: 'System (Seed)',
      },
    });

    console.log(`  ✅ Created: ${assetTag} — ${asset.name}`);
  }

  // =============================================
  // Seed Sample Notifications
  // =============================================
  const notifCount = await prisma.notification.count();
  if (notifCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          type: 'SYSTEM_UPDATE',
          title: 'System Deployed Successfully',
          description: 'IT Inventory Monitoring System v1.0 has been deployed and is now operational.',
          isRead: false,
        },
        {
          type: 'AUDIT_COMPLETE',
          title: 'Initial Asset Inventory Complete',
          description: '7 assets have been registered in the system during initial setup.',
          isRead: false,
        },
      ],
    });
    console.log('\n  🔔 Seeded 2 sample notifications');
  }

  // =============================================
  // Seed Activity Logs
  // =============================================
  const activityCount = await prisma.activityLog.count();
  if (activityCount === 0) {
    await prisma.activityLog.create({
      data: {
        userId: adminUser.id,
        action: 'SYSTEM_INITIALIZED',
        entity: 'System',
        details: 'IT Inventory Monitoring System initialized with seed data',
        ipAddress: '127.0.0.1',
      },
    });
    console.log('  📋 Seeded initial activity log');
  }

  console.log('\n🎉 Seeded 7 assets with audit logs.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
