import bcrypt from "bcrypt";
import { PrismaClient, TuitionCaseStatus, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const seedPassword = "Password123!";

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(seedPassword, 12);

  const parent = await prisma.user.upsert({
    where: { email: "parent@example.com" },
    update: {
      passwordHash,
      role: UserRole.PARENT
    },
    create: {
      email: "parent@example.com",
      passwordHash,
      role: UserRole.PARENT
    }
  });

  const tutor = await prisma.user.upsert({
    where: { email: "tutor@example.com" },
    update: {
      passwordHash,
      role: UserRole.TUTOR
    },
    create: {
      email: "tutor@example.com",
      passwordHash,
      role: UserRole.TUTOR
    }
  });

  const secondTutor = await prisma.user.upsert({
    where: { email: "second-tutor@example.com" },
    update: {
      passwordHash,
      role: UserRole.TUTOR
    },
    create: {
      email: "second-tutor@example.com",
      passwordHash,
      role: UserRole.TUTOR
    }
  });

  const tutorProfile = await prisma.tutorProfile.upsert({
    where: { userId: tutor.id },
    update: {
      displayName: "Aisha Rahman",
      qualifications: "BSc Mathematics, 5 years tutoring secondary students",
      experiences: "Specializes in algebra, exam preparation, and study planning"
    },
    create: {
      userId: tutor.id,
      displayName: "Aisha Rahman",
      qualifications: "BSc Mathematics, 5 years tutoring secondary students",
      experiences: "Specializes in algebra, exam preparation, and study planning"
    }
  });

  await prisma.tutorProfile.upsert({
    where: { userId: secondTutor.id },
    update: {
      displayName: "Daniel Tan",
      qualifications: "MSc Physics, former teaching assistant",
      experiences: "Supports physics, calculus, and structured homework review"
    },
    create: {
      userId: secondTutor.id,
      displayName: "Daniel Tan",
      qualifications: "MSc Physics, former teaching assistant",
      experiences: "Supports physics, calculus, and structured homework review"
    }
  });

  const mathCase = await prisma.tuitionCase.upsert({
    where: { id: "seed-case-math" },
    update: {
      ownerId: parent.id,
      title: "Math tutor for Grade 8",
      subject: "Mathematics",
      level: "Grade 8",
      location: "Jakarta Selatan",
      budgetPerHour: "250000",
      status: TuitionCaseStatus.OPEN
    },
    create: {
      id: "seed-case-math",
      ownerId: parent.id,
      title: "Math tutor for Grade 8",
      subject: "Mathematics",
      level: "Grade 8",
      location: "Jakarta Selatan",
      budgetPerHour: "250000",
      status: TuitionCaseStatus.OPEN
    }
  });

  await prisma.tuitionCase.upsert({
    where: { id: "seed-case-physics" },
    update: {
      ownerId: parent.id,
      title: "Physics support for high school",
      subject: "Physics",
      level: "Grade 11",
      location: "Online",
      budgetPerHour: "300000",
      status: TuitionCaseStatus.OPEN
    },
    create: {
      id: "seed-case-physics",
      ownerId: parent.id,
      title: "Physics support for high school",
      subject: "Physics",
      level: "Grade 11",
      location: "Online",
      budgetPerHour: "300000",
      status: TuitionCaseStatus.OPEN
    }
  });

  await prisma.caseInvitation.upsert({
    where: {
      caseId_tutorId: {
        caseId: mathCase.id,
        tutorId: tutor.id
      }
    },
    update: {
      revokedAt: null
    },
    create: {
      caseId: mathCase.id,
      tutorId: tutor.id
    }
  });

  await prisma.document.upsert({
    where: { storageKey: "seed/tutor-profile-aisha-cv.pdf" },
    update: {
      tutorProfileId: tutorProfile.id,
      uploadedById: tutor.id,
      originalFilename: "aisha-cv.pdf",
      mimeType: "application/pdf",
      size: 128000
    },
    create: {
      tutorProfileId: tutorProfile.id,
      uploadedById: tutor.id,
      originalFilename: "aisha-cv.pdf",
      storageKey: "seed/tutor-profile-aisha-cv.pdf",
      mimeType: "application/pdf",
      size: 128000
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
