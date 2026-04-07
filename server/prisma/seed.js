import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.asset.deleteMany();

  // Reset auto-increment
  await prisma.$executeRaw`ALTER SEQUENCE "Asset_id_seq" RESTART WITH 1`;
  await prisma.$executeRaw`ALTER SEQUENCE "AuditLog_id_seq" RESTART WITH 1`;

  // =============================================
  // Seed Assets
  // =============================================

  const assets = [
    {
      name: 'MacBook Pro 16"',
      assetTag: 'IT-ASSET-0001',
      category: 'LAPTOP',
      serialNumber: 'C02ZN1MDLVDM',
      purchaseDate: new Date('2024-03-15'),
      purchasePrice: 2499.0,
      salvageValue: 400.0,
      usefulLifeYears: 4,
      depreciationMethod: 'STRAIGHT_LINE',
      assignedEmployee: 'Maria Santos',
      status: 'IN_USE',
      location: 'Building A, Room 201',
      warrantyExpiry: new Date('2027-03-15'),
      notes: 'M3 Pro chip, 36GB RAM, 512GB SSD',
    },
    {
      name: 'Dell UltraSharp 27" 4K',
      assetTag: 'IT-ASSET-0002',
      category: 'MONITOR',
      serialNumber: 'CN-0K3HDP-FCC00-4B2-0912',
      purchaseDate: new Date('2023-08-01'),
      purchasePrice: 649.0,
      salvageValue: 50.0,
      usefulLifeYears: 5,
      depreciationMethod: 'STRAIGHT_LINE',
      assignedEmployee: null,
      status: 'AVAILABLE',
      location: 'Storage Room B',
      warrantyExpiry: new Date('2026-08-01'),
      notes: 'USB-C hub built-in, mDP + HDMI',
    },
    {
      name: 'HP ProLiant DL380 Gen10',
      assetTag: 'IT-ASSET-0003',
      category: 'SERVER',
      serialNumber: 'MXQ94906YZ',
      purchaseDate: new Date('2023-01-10'),
      purchasePrice: 12500.0,
      salvageValue: 1500.0,
      usefulLifeYears: 7,
      depreciationMethod: 'DOUBLE_DECLINING',
      assignedEmployee: 'John Rivera',
      status: 'IN_USE',
      location: 'Server Room, Rack 3',
      warrantyExpiry: new Date('2028-01-10'),
      notes: '2x Xeon Gold 6248R, 256GB RAM, 8x 1.2TB SAS',
    },
    {
      name: 'iPhone 15 Pro',
      assetTag: 'IT-ASSET-0004',
      category: 'PHONE',
      serialNumber: 'F4GDR0FPJQ7T',
      purchaseDate: new Date('2024-09-20'),
      purchasePrice: 1199.0,
      salvageValue: 200.0,
      usefulLifeYears: 3,
      depreciationMethod: 'DOUBLE_DECLINING',
      assignedEmployee: 'Ana Cruz',
      status: 'IN_USE',
      location: 'Mobile',
      warrantyExpiry: new Date('2025-09-20'),
      notes: '256GB, Natural Titanium, AppleCare+',
    },
    {
      name: 'Epson WorkForce Pro WF-C5890',
      assetTag: 'IT-ASSET-0005',
      category: 'PRINTER',
      serialNumber: 'X3TY089234',
      purchaseDate: new Date('2024-01-05'),
      purchasePrice: 899.0,
      salvageValue: 100.0,
      usefulLifeYears: 5,
      depreciationMethod: 'UNITS_OF_PRODUCTION',
      totalUnits: 50000,
      unitsUsed: 18500,
      assignedEmployee: null,
      status: 'AVAILABLE',
      location: 'Building A, Floor 2',
      warrantyExpiry: new Date('2026-01-05'),
      notes: 'Network color laser, auto-duplex, 50-page ADF',
    },
    {
      name: 'Cisco Catalyst 9200L-48P',
      assetTag: 'IT-ASSET-0006',
      category: 'NETWORKING',
      serialNumber: 'FOC2538Y0PQ',
      purchaseDate: new Date('2023-06-18'),
      purchasePrice: 4200.0,
      salvageValue: 500.0,
      usefulLifeYears: 6,
      depreciationMethod: 'STRAIGHT_LINE',
      assignedEmployee: null,
      status: 'UNDER_REPAIR',
      location: 'Server Room, Rack 1',
      warrantyExpiry: new Date('2026-06-18'),
      notes: '48-port PoE+, Catalyst OS, DNA Essentials license',
    },
    {
      name: 'Logitech MX Master 3S',
      assetTag: 'IT-ASSET-0007',
      category: 'PERIPHERAL',
      serialNumber: '2220LGT4891',
      purchaseDate: new Date('2022-11-01'),
      purchasePrice: 99.0,
      salvageValue: 10.0,
      usefulLifeYears: 3,
      depreciationMethod: 'STRAIGHT_LINE',
      assignedEmployee: null,
      status: 'RETIRED',
      location: 'Disposed',
      warrantyExpiry: new Date('2024-11-01'),
      notes: 'Wireless mouse, USB-C rechargeable — scroll wheel malfunctioning',
    },
  ];

  for (const assetData of assets) {
    const asset = await prisma.asset.create({ data: assetData });
    console.log(`  ✅ Created: ${asset.assetTag} — ${asset.name}`);

    // Create initial audit log entry
    await prisma.auditLog.create({
      data: {
        assetId: asset.id,
        action: 'CREATED',
        details: `Asset "${asset.name}" created with tag ${asset.assetTag}`,
      },
    });

    // If asset is assigned, add assignment audit log
    if (asset.assignedEmployee) {
      await prisma.auditLog.create({
        data: {
          assetId: asset.id,
          action: 'ASSIGNED',
          employeeName: asset.assignedEmployee,
          details: `Assigned to "${asset.assignedEmployee}"`,
        },
      });
    }
  }

  console.log(`\n🎉 Seeded ${assets.length} assets with audit logs.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
