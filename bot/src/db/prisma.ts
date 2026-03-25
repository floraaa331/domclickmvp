import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function getOrCreateUser(
  telegramId: number,
  firstName?: string,
  username?: string
) {
  return prisma.user.upsert({
    where: { telegramId: BigInt(telegramId) },
    update: { firstName, username },
    create: {
      telegramId: BigInt(telegramId),
      firstName,
      username,
    },
  });
}

export async function setUserName(telegramId: number, customName: string) {
  return prisma.user.update({
    where: { telegramId: BigInt(telegramId) },
    data: { customName },
  });
}

export async function getUserName(telegramId: number): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });
  return user?.customName ?? user?.firstName ?? null;
}

export async function saveCalculation(data: {
  telegramId: number;
  propertyType: string;
  propertyCost: number;
  downPayment: number;
  termYears: number;
  rate: number;
  monthlyPayment: number;
  totalPayment: number;
  overpayment: number;
}) {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(data.telegramId) },
  });
  if (!user) return;

  return prisma.calculation.create({
    data: {
      userId: user.id,
      propertyType: data.propertyType,
      propertyCost: data.propertyCost,
      downPayment: data.downPayment,
      termYears: data.termYears,
      rate: data.rate,
      monthlyPayment: data.monthlyPayment,
      totalPayment: data.totalPayment,
      overpayment: data.overpayment,
    },
  });
}

export async function getChecklistProgress(telegramId: number) {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });
  if (!user) return null;

  return prisma.checklistProgress.findUnique({
    where: { userId: user.id },
  });
}

export async function updateChecklistProgress(
  telegramId: number,
  step: number,
  completedSteps: number[],
  skippedSteps: number[]
) {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });
  if (!user) return;

  return prisma.checklistProgress.upsert({
    where: { userId: user.id },
    update: {
      currentStep: step,
      completedSteps: JSON.stringify(completedSteps),
      skippedSteps: JSON.stringify(skippedSteps),
    },
    create: {
      userId: user.id,
      currentStep: step,
      completedSteps: JSON.stringify(completedSteps),
      skippedSteps: JSON.stringify(skippedSteps),
    },
  });
}

export async function logAction(
  telegramId: number,
  action: string,
  details?: string
) {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });
  if (!user) return;

  return prisma.userAction.create({
    data: {
      userId: user.id,
      action,
      details,
    },
  });
}

export async function getStats() {
  const totalUsers = await prisma.user.count();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calcsToday = await prisma.calculation.count({
    where: { createdAt: { gte: today } },
  });

  const avgCostResult = await prisma.calculation.aggregate({
    _avg: { propertyCost: true },
  });

  const recentActions = await prisma.userAction.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const totalCalcs = await prisma.calculation.count();

  return {
    totalUsers,
    calcsToday,
    totalCalcs,
    avgPropertyCost: avgCostResult._avg.propertyCost ?? 0,
    recentActions,
  };
}

export async function getUserStats(telegramId: number) {
  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
    include: {
      calculations: { orderBy: { createdAt: "desc" } },
      checklistProgress: true,
    },
  });
  return user;
}
