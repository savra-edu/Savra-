import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Create School
  console.log('📚 Creating school...');
  const school = await prisma.school.upsert({
    where: { code: 'SAVRA001' },
    update: {},
    create: {
      name: 'Savra International School',
      code: 'SAVRA001',
    },
  });
  console.log(`   ✓ School created: ${school.name} (${school.code})\n`);

  // Create Subjects
  console.log('📖 Creating subjects...');
  const subjectsData = [
    { name: 'Maths', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'English', code: 'ENG' },
    { name: 'History', code: 'HIST' },
    { name: 'Geography', code: 'GEO' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Chemistry', code: 'CHEM' },
    { name: 'Biology', code: 'BIO' },
  ];

  const subjects: Record<string, { id: string; name: string }> = {};
  for (const subjectData of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { code: subjectData.code },
      update: {},
      create: subjectData,
    });
    subjects[subjectData.code] = subject;
    console.log(`   ✓ ${subject.name}`);
  }
  console.log('');

  // Create Chapters for each subject
  console.log('📑 Creating chapters...');
  const chaptersData: Record<string, string[]> = {
    MATH: [
      'Fractions & Decimals',
      'The Triangle & Its Properties',
      'Rational Numbers',
      'Data Handling',
      'Simple Equations',
      'Exponents & Powers',
      'Algebraic Expressions',
      'Linear Equations',
      'Geometry',
      'Perimeter & Area',
      'Lines & Angles',
    ],
    SCI: [
      'Nutrition in Plants',
      'Nutrition in Animals',
      'Heat',
      'Acids, Bases & Salts',
      'Physical & Chemical Changes',
      'Weather, Climate & Adaptations',
      'Respiration in Organisms',
      'Transportation in Animals & Plants',
      'Reproduction in Plants',
    ],
    ENG: [
      'Grammar Basics',
      'Tenses',
      'Active & Passive Voice',
      'Direct & Indirect Speech',
      'Comprehension',
      'Essay Writing',
      'Letter Writing',
      'Creative Writing',
    ],
    HIST: [
      'Ancient Civilizations',
      'Medieval Period',
      'Modern History',
      'Indian Freedom Struggle',
      'World Wars',
      'Post-Independence India',
    ],
    GEO: [
      'Our Environment',
      'Natural Vegetation & Wildlife',
      'Water Resources',
      'Agriculture',
      'Industries',
      'Human Resources',
    ],
    PHY: [
      'Motion',
      'Force & Laws of Motion',
      'Gravitation',
      'Work & Energy',
      'Sound',
      'Light',
      'Electricity',
      'Magnetism',
    ],
    CHEM: [
      'Matter in Our Surroundings',
      'Is Matter Around Us Pure',
      'Atoms & Molecules',
      'Structure of Atom',
      'Chemical Reactions',
      'Periodic Table',
    ],
    BIO: [
      'Cell Structure',
      'Tissues',
      'Diversity in Living Organisms',
      'Life Processes',
      'Control & Coordination',
      'Heredity & Evolution',
    ],
  };

  for (const [subjectCode, chapters] of Object.entries(chaptersData)) {
    const subject = subjects[subjectCode];
    for (let i = 0; i < chapters.length; i++) {
      await prisma.chapter.upsert({
        where: {
          id: `${subject.id}-chapter-${i + 1}`,
        },
        update: {},
        create: {
          id: `${subject.id}-chapter-${i + 1}`,
          subjectId: subject.id,
          name: chapters[i],
          orderIndex: i + 1,
        },
      });
    }
    console.log(`   ✓ ${subject.name}: ${chapters.length} chapters`);
  }
  console.log('');

  // Create Classes (Grades 1-12, Sections A-E)
  console.log('🏫 Creating classes...');
  const grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const sections = ['A', 'B', 'C', 'D', 'E'];
  let classCount = 0;

  for (const grade of grades) {
    for (const section of sections) {
      await prisma.class.upsert({
        where: {
          schoolId_grade_section: {
            schoolId: school.id,
            grade,
            section,
          },
        },
        update: {},
        create: {
          schoolId: school.id,
          grade,
          section,
          name: `Class ${grade} ${section}`,
        },
      });
      classCount++;
    }
  }
  console.log(`   ✓ Created ${classCount} classes (Grades 1-12, Sections A-E)\n`);

  // Get a class for student
  const class10A = await prisma.class.findFirst({
    where: { grade: 10, section: 'A', schoolId: school.id },
  });

  // Create Test Users
  console.log('👤 Creating test users...');
  const passwordHash = await bcrypt.hash('password123', 12);

  // Test Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@savra.com' },
    update: {},
    create: {
      email: 'teacher@savra.com',
      passwordHash,
      name: 'Shardul Mishra',
      role: 'teacher',
    },
  });

  await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      schoolId: school.id,
      location: 'Delhi, India',
    },
  });

  // Assign subjects to teacher
  const mathSubject = subjects['MATH'];
  const physicsSubject = subjects['PHY'];

  const teacher = await prisma.teacher.findUnique({
    where: { userId: teacherUser.id },
  });

  if (teacher) {
    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacher.id, subjectId: mathSubject.id } },
      update: {},
      create: { teacherId: teacher.id, subjectId: mathSubject.id },
    });

    await prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacher.id, subjectId: physicsSubject.id } },
      update: {},
      create: { teacherId: teacher.id, subjectId: physicsSubject.id },
    });

    // Assign classes to teacher
    if (class10A) {
      await prisma.teacherClass.upsert({
        where: { teacherId_classId: { teacherId: teacher.id, classId: class10A.id } },
        update: {},
        create: { teacherId: teacher.id, classId: class10A.id },
      });
    }
  }

  console.log(`   ✓ Teacher: ${teacherUser.email} (password: password123)`);

  // Test Student
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@savra.com' },
    update: {},
    create: {
      email: 'student@savra.com',
      passwordHash,
      name: 'Aarav Jain',
      role: 'student',
    },
  });

  if (class10A) {
    await prisma.student.upsert({
      where: { userId: studentUser.id },
      update: {},
      create: {
        userId: studentUser.id,
        classId: class10A.id,
        rollNumber: '10A-001',
        totalPoints: 750,
      },
    });
  }
  console.log(`   ✓ Student: ${studentUser.email} (password: password123)`);

  // Test Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@savra.com' },
    update: {},
    create: {
      email: 'admin@savra.com',
      passwordHash,
      name: 'Shauryaman Ray',
      role: 'admin',
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      schoolId: school.id,
    },
  });
  console.log(`   ✓ Admin: ${adminUser.email} (password: password123)\n`);

  // Create some additional students for leaderboard
  console.log('👥 Creating additional students for leaderboard...');
  const additionalStudents = [
    { name: 'Rahul Kumar', points: 850, roll: '10A-002' },
    { name: 'Priya Sharma', points: 820, roll: '10A-003' },
    { name: 'Amit Singh', points: 790, roll: '10A-004' },
    { name: 'Neha Gupta', points: 720, roll: '10A-005' },
    { name: 'Vikram Patel', points: 680, roll: '10A-006' },
  ];

  for (const studentData of additionalStudents) {
    const email = `${studentData.name.toLowerCase().replace(' ', '.')}@savra.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        name: studentData.name,
        role: 'student',
      },
    });

    if (class10A) {
      await prisma.student.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          classId: class10A.id,
          rollNumber: studentData.roll,
          totalPoints: studentData.points,
        },
      });
    }
    console.log(`   ✓ ${studentData.name} (${studentData.points} points)`);
  }

  console.log('\n========================================');
  console.log('✅ Database seeding completed!');
  console.log('========================================\n');
  console.log('Test accounts:');
  console.log('  Teacher: teacher@savra.com / password123');
  console.log('  Student: student@savra.com / password123');
  console.log('  Admin:   admin@savra.com / password123');
  console.log('\nSchool Code: SAVRA001\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
