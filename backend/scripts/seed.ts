import * as bcrypt from 'bcrypt';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

const USERS = [
  {
    email: 'admin@fixmind.local',
    password: 'Admin123!@#',
    fullName: 'System Administrator',
    role: 'ADMIN' as const,
    phone: '081234567890',
  },
  {
    email: 'tech@fixmind.local',
    password: 'Tech123!@#',
    fullName: 'Budi Santoso',
    role: 'TECHNICIAN' as const,
    phone: '081234567891',
  },
  {
    email: 'user@fixmind.local',
    password: 'User123!@#',
    fullName: 'Ani Wijaya',
    role: 'USER' as const,
    phone: '081234567892',
  },
];

async function seedUsers() {
  for (const u of USERS) {
    const [existing] = await sql`
      SELECT id FROM users WHERE email = ${u.email} AND deleted_at IS NULL
    `;
    if (existing) {
      console.log(`skip user ${u.email}`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 12);
    await sql`
      INSERT INTO users (email, password_hash, full_name, role, phone)
      VALUES (${u.email}, ${hash}, ${u.fullName}, ${u.role}, ${u.phone})
    `;
    console.log(`seeded user ${u.email} (${u.role})`);
  }
}

async function seedFacilities() {
  const rooms = [
    { name: 'Ruangan Serbaguna', code: 'RSG-1', floor: '1', building: 'Gedung Utama', description: 'Ruangan multifungsi untuk berbagai kegiatan rapat dan acara' },
    { name: 'Ruangan Divisi Keuangan', code: 'KEU-2', floor: '2', building: 'Gedung Utama', description: 'Ruangan operasional dan administrasi Divisi Keuangan' },
    { name: 'Ruangan Divisi Umum', code: 'UMM-2', floor: '2', building: 'Gedung Utama', description: 'Ruangan operasional Tata Usaha dan Divisi Umum' },
    { name: 'Ruangan Divisi Persidangan', code: 'PSD-3', floor: '3', building: 'Gedung Utama', description: 'Ruangan operasional Divisi Persidangan dan Perundang-undangan' },
    { name: 'Lobby Utama', code: 'LOB-1', floor: '1', building: 'Gedung Utama', description: 'Area penerimaan tamu utama DPRD' },
    { name: 'Ruangan Paripurna', code: 'PRP-3', floor: '3', building: 'Gedung Paripurna', description: 'Ruang sidang utama Paripurna DPRD Kota Semarang' },
    { name: 'Ruangan Humas', code: 'HMS-1', floor: '1', building: 'Gedung Utama', description: 'Ruangan operasional Hubungan Masyarakat dan Publikasi' },
  ];

  const roomIds: string[] = [];
  for (const r of rooms) {
    const [row] = await sql<{ id: string }[]>`
      INSERT INTO rooms (name, code, floor, building, description)
      VALUES (${r.name}, ${r.code}, ${r.floor}, ${r.building}, ${r.description})
      RETURNING id
    `;
    roomIds.push(row.id);
    console.log(`seeded room ${r.code}`);
  }

  const assets = [
    { roomIdx: 5, name: 'Sistem Audio Paripurna', assetCode: 'AUD-PRP-1', category: 'Elektronik' },
    { roomIdx: 5, name: 'AC Sentral 5PK', assetCode: 'AC-PRP-1', category: 'HVAC' },
    { roomIdx: 0, name: 'Proyektor Resolusi Tinggi', assetCode: 'PRJ-RSG-1', category: 'Elektronik' },
    { roomIdx: 4, name: 'Pintu Geser Otomatis', assetCode: 'DOR-LOB-1', category: 'Bangunan', status: 'NEEDS_MAINTENANCE' },
    { roomIdx: 3, name: 'Mesin Fotokopi Heavy Duty', assetCode: 'PRN-PSD-1', category: 'Elektronik' },
    { roomIdx: 1, name: 'Brankas Dokumen Keuangan', assetCode: 'SF-KEU-1', category: 'Perabotan' },
    { roomIdx: 2, name: 'Dispenser Air Panas/Dingin', assetCode: 'DSP-UMM-1', category: 'Elektronik' },
    { roomIdx: 6, name: 'Kamera DSLR Dokumentasi', assetCode: 'CAM-HMS-1', category: 'Elektronik' },
  ];

  for (const a of assets) {
    await sql`
      INSERT INTO assets (room_id, name, asset_code, category, status)
      VALUES (
        ${roomIds[a.roomIdx]},
        ${a.name},
        ${a.assetCode},
        ${a.category},
        ${(a as { status?: string }).status ?? 'OPERATIONAL'}
      )
    `;
    console.log(`seeded asset ${a.assetCode}`);
  }

  return { roomIds };
}

async function seedReports(roomIds: string[]) {
  if (!roomIds.length) return;

  const [user] = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE email = 'user@fixmind.local' LIMIT 1
  `;
  const [tech] = await sql<{ id: string }[]>`
    SELECT id FROM users WHERE email = 'tech@fixmind.local' LIMIT 1
  `;
  const [asset1] = await sql<{ id: string }[]>`
    SELECT id FROM assets WHERE asset_code = 'AC-PRP-1' LIMIT 1
  `;
  const [asset2] = await sql<{ id: string }[]>`
    SELECT id FROM assets WHERE asset_code = 'DOR-LOB-1' LIMIT 1
  `;

  if (!user || !tech) return;

  const [report1] = await sql<{ id: string }[]>`
    INSERT INTO reports (reporter_id, room_id, asset_id, title, description, status, priority, ai_analysis_status)
    VALUES (
      ${user.id}, ${roomIds[5]}, ${asset1?.id ?? null},
      'Pendingin Ruangan (AC) Paripurna Tidak Dingin',
      'AC sentral di Ruangan Paripurna hanya mengeluarkan angin biasa, suhu ruangan menjadi sangat panas padahal akan ada rapat penting siang ini.',
      'ASSIGNED', 'HIGH', 'COMPLETED'
    )
    RETURNING id
  `;

  await sql`
    UPDATE reports SET
      assigned_technician_id = ${tech.id},
      assigned_at = now(),
      ai_priority_score = 85,
      ai_priority_reason = 'Kerusakan fasilitas iklim di ruang sidang utama dapat mengganggu jalannya agenda penting pemerintahan.',
      ai_recommendation = 'Lakukan pemeriksaan tekanan freon dan bersihkan filter udara sentral segera.',
      ai_estimated_repair_hours = 3,
      ai_suggested_action = 'Tugaskan teknisi HVAC segera sebelum rapat paripurna dimulai.'
    WHERE id = ${report1.id}
  `;

  await sql`
    INSERT INTO report_histories (report_id, actor_id, action, new_status, note)
    VALUES
      (${report1.id}, ${user.id}, 'CREATED', 'PENDING', 'Laporan dibuat oleh pengguna'),
      (${report1.id}, NULL, 'AI_ANALYZED', 'AI_ANALYSIS', 'Prioritas AI: TINGGI'),
      (${report1.id}, NULL, 'ASSIGNED', 'ASSIGNED', 'Laporan ditugaskan ke teknisi Budi Santoso')
  `;

  await sql`
    INSERT INTO reports (reporter_id, room_id, asset_id, title, description, status, priority, ai_analysis_status)
    VALUES (
      ${user.id}, ${roomIds[4]}, ${asset2?.id ?? null},
      'Pintu Kaca Otomatis Lobby Macet',
      'Pintu geser otomatis di lobby utama terkadang macet dan tidak mau terbuka penuh. Mohon segera diperbaiki agar tidak mengganggu tamu yang datang.',
      'PENDING', 'MEDIUM', 'COMPLETED'
    )
  `;

  console.log('seeded sample reports');
}

async function seed() {
  await sql`TRUNCATE TABLE reports, assets, rooms CASCADE;`;
  await seedUsers();
  const { roomIds } = await seedFacilities();
  await seedReports(roomIds);
  console.log('\nSeed complete. Login credentials:');
  for (const u of USERS) {
    console.log(`  ${u.role.padEnd(11)} ${u.email} / ${u.password}`);
  }
  await sql.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
