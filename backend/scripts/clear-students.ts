import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearStudents() {
  console.log('Clearing seed student data...');

  // Get all seed student user IDs
  const seedStudentEmails = [
    'student@savra.com',
    'rahul@savra.com',
    'priya@savra.com',
    'amit@savra.com',
    'neha@savra.com',
    'vikram@savra.com'
  ];

  try {
    // Find students by email
    const users = await prisma.user.findMany({
      where: {
        email: { in: seedStudentEmails },
        role: 'student'
      },
      select: { id: true, email: true }
    });

    console.log(`Found ${users.length} seed students to delete`);

    if (users.length === 0) {
      console.log('No seed students found');
      return;
    }

    const userIds = users.map(u => u.id);

    // Get student IDs
    const students = await prisma.student.findMany({
      where: { userId: { in: userIds } },
      select: { id: true }
    });
    const studentIds = students.map(s => s.id);

    // Delete quiz attempts and answers
    if (studentIds.length > 0) {
      // Delete student answers first
      await prisma.studentAnswer.deleteMany({
        where: {
          attempt: {
            studentId: { in: studentIds }
          }
        }
      });
      console.log('Deleted student answers');

      // Delete quiz attempts
      await prisma.quizAttempt.deleteMany({
        where: { studentId: { in: studentIds } }
      });
      console.log('Deleted quiz attempts');

      // Delete students
      await prisma.student.deleteMany({
        where: { id: { in: studentIds } }
      });
      console.log('Deleted students');
    }

    // Delete users
    await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });
    console.log('Deleted users');

    console.log('Successfully cleared all seed student data!');
  } catch (error) {
    console.error('Error clearing students:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearStudents();
