/**
 * Seed Data Generator cho Test Environment
 * Dùng để tạo dữ liệu test nhất quán cho tất cả test cases
 */
import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

function getConnectionString() {
  const rawConnectionString = process.env.DATABASE_URL;

  if (!rawConnectionString) {
    throw new Error(
      'Thiếu DATABASE_URL. Hãy thêm DATABASE_URL vào file .env trước khi chạy npm run db:seed.'
    );
  }

  const url = new URL(rawConnectionString);
  const fallbackPassword = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD;

  if (!url.password && fallbackPassword) {
    url.password = fallbackPassword;
  }

  if (!url.password) {
    throw new Error(
      'DATABASE_URL chưa có password. Hãy thêm password vào DATABASE_URL hoặc set PGPASSWORD/POSTGRES_PASSWORD.'
    );
  }

  return url.toString();
}

const adapter = new PrismaPg({
  connectionString: getConnectionString(),
});
const prisma = new PrismaClient({ adapter } );

export const testUsers = {
  owner: {
    email: 'owner_test@example.com',
    password: 'password123',
    name: 'Chủ Trọ Test',
    phone: '+84912345678',
    role: 'LANDLORD',
  },
  tenant: {
    email: 'tenant_test@example.com',
    password: 'password123',
    name: 'Khách Thuê Test',
    phone: '+84987654321',
    role: 'TENANT',
  },
  admin: {
    email: 'admin_test@example.com',
    password: 'password123',
    name: 'Quản Trị Viên Test',
    phone: '+84901234567',
    role: 'ADMIN',
  },
};

export async function seedTestData() {
  console.log('🌱 Bắt đầu seeding dữ liệu test...');

  try {
    // Xóa dữ liệu cũ để reset database
    console.log('🗑️  Xóa dữ liệu cũ...');
    await prisma.payment.deleteMany({});
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.roomService.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.user.deleteMany({});

    // Hash mật khẩu
    const ownerPassword = await bcrypt.hash(testUsers.owner.password, 10);
    const tenantPassword = await bcrypt.hash(testUsers.tenant.password, 10);
    const adminPassword = await bcrypt.hash(testUsers.admin.password, 10);

    // Tạo test users
    console.log('👤 Tạo test users...');
    const ownerUser = await prisma.user.create({
      data: {
        email: testUsers.owner.email,
        password: ownerPassword,
        name: testUsers.owner.name,
        phone: testUsers.owner.phone,
        role: 'LANDLORD',
      },
    });

    const tenantUser = await prisma.user.create({
      data: {
        email: testUsers.tenant.email,
        password: tenantPassword,
        name: testUsers.tenant.name,
        phone: testUsers.tenant.phone,
        role: 'TENANT',
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: testUsers.admin.email,
        password: adminPassword,
        name: testUsers.admin.name,
        phone: testUsers.admin.phone,
        role: 'ADMIN',
      },
    });

    // Tạo Property (Tài sản/Khu trọ)
    console.log('🏢 Tạo tài sản test...');
    const property = await prisma.property.create({
      data: {
        name: 'Khu Trọ Test - Automation',
        address: '123 Đường Tự Động, Quận 1, TP.HCM',
        landlordId: ownerUser.id,
        description: 'Khu trọ dùng cho kiểm thử tự động',
      },
    });

    // Tạo Rooms
    console.log('🚪 Tạo phòng test...');
    const occupiedRoom = await prisma.room.create({
      data: {
        name: '101',
        propertyId: property.id,
        area: 20,
        price: 2000000, // Giá tiền vnd/tháng
        capacity: 2,
        status: 'RENTED', // Phòng đang cho thuê
      },
    });

    const emptyRoom = await prisma.room.create({
      data: {
        name: '102',
        propertyId: property.id,
        area: 25,
        price: 2500000,
        capacity: 2,
        status: 'AVAILABLE', // Phòng trống
      },
    });

    // Tạo Services
    console.log('⚡ Tạo dịch vụ test...');
    const electricService = await prisma.service.create({
      data: {
        name: 'Điện',
        price: 3500, // 3500 VND/kWh
        unit: 'kWh',
        isMetered: true,
        propertyId: property.id,
      },
    });

    const waterService = await prisma.service.create({
      data: {
        name: 'Nước',
        price: 5000, // 5000 VND/m3
        unit: 'm3',
        isMetered: true,
        propertyId: property.id,
      },
    });

    // Gán service cho phòng
    await prisma.roomService.create({
      data: {
        roomId: occupiedRoom.id,
        serviceId: electricService.id,
      },
    });
    await prisma.roomService.create({
      data: {
        roomId: occupiedRoom.id,
        serviceId: waterService.id,
      },
    });

    // Tạo Contract
    console.log('📄 Tạo hợp đồng test...');
    const contract = await prisma.contract.create({
      data: {
        roomId: occupiedRoom.id,
        tenantId: tenantUser.id,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        roomPrice: 2000000,
        deposit: 4000000,
        status: 'ACTIVE',
      },
    });

    // Tạo Invoices
    console.log('📋 Tạo hóa đơn test...');
    await prisma.invoice.create({
      data: {
        title: 'Hóa đơn tháng 01/2026',
        contractId: contract.id,
        month: 1,
        year: 2026,
        totalAmount: 2350000,
        status: 'UNPAID',
        dueDate: new Date('2026-02-05'),
      },
    });

    await prisma.invoice.create({
      data: {
        title: 'Hóa đơn tháng 12/2025',
        contractId: contract.id,
        month: 12,
        year: 2025,
        totalAmount: 2300000,
        status: 'PAID',
        dueDate: new Date('2026-01-05'),
      },
    });

    console.log('✅ Hoàn thành seeding dữ liệu test!');
    console.log('📊 Dữ liệu đã tạo:');
    console.log(`   - Owner: ${ownerUser.email}`);
    console.log(`   - Tenant: ${tenantUser.email}`);
    console.log(`   - Admin: ${adminUser.email}`);
    console.log(`   - Property: ${property.name}`);
    console.log(`   - Rooms: ${occupiedRoom.name} (rented), ${emptyRoom.name} (available)`);
    console.log(`   - Services: Điện, Nước`);
    console.log(`   - Contract: 1 active`);
    console.log(`   - Invoices: 1 unpaid, 1 paid`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Lỗi khi seeding dữ liệu:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Nếu chạy script này trực tiếp
if (require.main === module) {
  seedTestData();
}

export default seedTestData;
