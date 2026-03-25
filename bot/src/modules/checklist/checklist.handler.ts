import { Bot, InlineKeyboard } from "grammy";
import {
  getChecklistProgress,
  updateChecklistProgress,
  logAction,
  getUserName,
} from "../../db/prisma";
import { navButtons } from "../../utils/keyboard";
import { checklistSteps, getStep, calculateProgress } from "./checklist.service";
import {
  checklistWelcomeMessage,
  resumeMessage,
  stepMessage,
  completionMessage,
  tipsDetailMessage,
} from "./checklist.messages";

function parseStepsJson(raw: string | null): number[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as number[];
    return [];
  } catch {
    return [];
  }
}

function stepKeyboard(
  stepNumber: number,
  completed: number[],
  skipped: number[]
): InlineKeyboard {
  const kb = new InlineKeyboard();
  const isDone = completed.includes(stepNumber);
  const isSkipped = skipped.includes(stepNumber);

  if (!isDone && !isSkipped) {
    kb.text("✅ Готово", `checklist_done_${stepNumber}`);
    kb.text("⏭ Пропустить", `checklist_skip_${stepNumber}`);
    kb.row();
  }

  kb.text("💡 Подробнее", `checklist_tips_${stepNumber}`);
  kb.row();

  if (stepNumber > 1) {
    kb.text("← Назад", `checklist_back_${stepNumber}`);
  }
  kb.text("🏠 В главное меню", "main_menu");

  return kb;
}

function completionKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🔄 Пройти заново", "checklist_restart")
    .row()
    .text("🏠 В главное меню", "main_menu");
}

function findNextStep(current: number, completed: number[], skipped: number[]): number | null {
  for (let i = current + 1; i <= checklistSteps.length; i++) {
    if (!completed.includes(i) && !skipped.includes(i)) {
      return i;
    }
  }
  // If all after current are done, check if all steps are done
  const allHandled = checklistSteps.every(
    (s) => completed.includes(s.number) || skipped.includes(s.number)
  );
  if (allHandled) return null;

  // Find first incomplete step
  for (let i = 1; i <= checklistSteps.length; i++) {
    if (!completed.includes(i) && !skipped.includes(i)) {
      return i;
    }
  }
  return null;
}

async function showStep(
  ctx: { reply: (text: string, options: Record<string, unknown>) => Promise<unknown> },
  telegramId: number,
  stepNumber: number,
  completed: number[],
  skipped: number[]
): Promise<void> {
  const step = getStep(stepNumber);
  if (!step) return;

  const text = stepMessage(step, completed, skipped);
  const kb = stepKeyboard(stepNumber, completed, skipped);

  await ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: kb,
  });
}

export function setupChecklist(bot: Bot): void {
  // Entry: reply keyboard button or inline callback
  bot.hears("✅ Чек-лист покупки", async (ctx) => {
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    await logAction(telegramId, "checklist_open");

    const progress = await getChecklistProgress(telegramId);
    const userName = await getUserName(telegramId);

    if (progress) {
      const completed = parseStepsJson(progress.completedSteps as string | null);
      const skipped = parseStepsJson(progress.skippedSteps as string | null);
      const { current } = calculateProgress(completed, skipped);

      if (current >= checklistSteps.length) {
        await ctx.reply(completionMessage(userName), {
          parse_mode: "HTML",
          reply_markup: completionKeyboard(),
        });
        return;
      }

      await ctx.reply(resumeMessage(progress.currentStep, userName), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text("▶️ Продолжить", "checklist_resume")
          .text("🔄 Начать заново", "checklist_restart")
          .row()
          .text("🏠 В главное меню", "main_menu"),
      });
      return;
    }

    await ctx.reply(checklistWelcomeMessage(userName), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("🚀 Начать", "checklist_start")
        .row()
        .text("🏠 В главное меню", "main_menu"),
    });
  });

  // Start checklist from inline button
  bot.callbackQuery("checklist_start", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    await logAction(telegramId, "checklist_start");

    const progress = await getChecklistProgress(telegramId);
    const userName = await getUserName(telegramId);

    if (progress) {
      const completed = parseStepsJson(progress.completedSteps as string | null);
      const skipped = parseStepsJson(progress.skippedSteps as string | null);
      const { current } = calculateProgress(completed, skipped);

      if (current >= checklistSteps.length) {
        await ctx.reply(completionMessage(userName), {
          parse_mode: "HTML",
          reply_markup: completionKeyboard(),
        });
        return;
      }

      await ctx.reply(resumeMessage(progress.currentStep, userName), {
        parse_mode: "HTML",
        reply_markup: new InlineKeyboard()
          .text("▶️ Продолжить", "checklist_resume")
          .text("🔄 Начать заново", "checklist_restart")
          .row()
          .text("🏠 В главное меню", "main_menu"),
      });
      return;
    }

    await updateChecklistProgress(telegramId, 1, [], []);
    await showStep(ctx, telegramId, 1, [], []);
  });

  // Resume from saved step
  bot.callbackQuery("checklist_resume", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    await logAction(telegramId, "checklist_resume");

    const progress = await getChecklistProgress(telegramId);
    if (!progress) {
      await updateChecklistProgress(telegramId, 1, [], []);
      await showStep(ctx, telegramId, 1, [], []);
      return;
    }

    const completed = parseStepsJson(progress.completedSteps as string | null);
    const skipped = parseStepsJson(progress.skippedSteps as string | null);
    await showStep(ctx, telegramId, progress.currentStep, completed, skipped);
  });

  // Restart checklist from scratch
  bot.callbackQuery("checklist_restart", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    await logAction(telegramId, "checklist_restart");
    await updateChecklistProgress(telegramId, 1, [], []);
    await showStep(ctx, telegramId, 1, [], []);
  });

  // Mark step as done
  bot.callbackQuery(/^checklist_done_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery("✅ Шаг выполнен!");
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    const match = ctx.match;
    const stepNumber = parseInt(match[1], 10);

    const progress = await getChecklistProgress(telegramId);
    const completed = parseStepsJson(progress?.completedSteps as string | null);
    const skipped = parseStepsJson(progress?.skippedSteps as string | null);

    if (!completed.includes(stepNumber)) {
      completed.push(stepNumber);
    }

    await logAction(telegramId, "checklist_done", `step_${stepNumber}`);

    const nextStep = findNextStep(stepNumber, completed, skipped);

    if (nextStep === null) {
      // All steps handled
      await updateChecklistProgress(telegramId, stepNumber, completed, skipped);
      const userName = await getUserName(telegramId);
      await ctx.reply(completionMessage(userName), {
        parse_mode: "HTML",
        reply_markup: completionKeyboard(),
      });
      return;
    }

    await updateChecklistProgress(telegramId, nextStep, completed, skipped);
    await showStep(ctx, telegramId, nextStep, completed, skipped);
  });

  // Skip step
  bot.callbackQuery(/^checklist_skip_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery("⏭ Шаг пропущен");
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    const match = ctx.match;
    const stepNumber = parseInt(match[1], 10);

    const progress = await getChecklistProgress(telegramId);
    const completed = parseStepsJson(progress?.completedSteps as string | null);
    const skipped = parseStepsJson(progress?.skippedSteps as string | null);

    if (!skipped.includes(stepNumber)) {
      skipped.push(stepNumber);
    }

    await logAction(telegramId, "checklist_skip", `step_${stepNumber}`);

    const nextStep = findNextStep(stepNumber, completed, skipped);

    if (nextStep === null) {
      await updateChecklistProgress(telegramId, stepNumber, completed, skipped);
      const userName = await getUserName(telegramId);
      await ctx.reply(completionMessage(userName), {
        parse_mode: "HTML",
        reply_markup: completionKeyboard(),
      });
      return;
    }

    await updateChecklistProgress(telegramId, nextStep, completed, skipped);
    await showStep(ctx, telegramId, nextStep, completed, skipped);
  });

  // Show detailed tips
  bot.callbackQuery(/^checklist_tips_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    const match = ctx.match;
    const stepNumber = parseInt(match[1], 10);

    const step = getStep(stepNumber);
    if (!step) return;

    await logAction(telegramId, "checklist_tips", `step_${stepNumber}`);

    const progress = await getChecklistProgress(telegramId);
    const completed = parseStepsJson(progress?.completedSteps as string | null);
    const skipped = parseStepsJson(progress?.skippedSteps as string | null);

    await ctx.reply(tipsDetailMessage(step), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard()
        .text("↩️ К шагу", `checklist_back_to_${stepNumber}`)
        .text("🏠 В главное меню", "main_menu"),
    });
  });

  // Back to step from tips detail view
  bot.callbackQuery(/^checklist_back_to_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    const match = ctx.match;
    const stepNumber = parseInt(match[1], 10);

    const progress = await getChecklistProgress(telegramId);
    const completed = parseStepsJson(progress?.completedSteps as string | null);
    const skipped = parseStepsJson(progress?.skippedSteps as string | null);

    await showStep(ctx, telegramId, stepNumber, completed, skipped);
  });

  // Go to previous step
  bot.callbackQuery(/^checklist_back_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    const match = ctx.match;
    const currentStep = parseInt(match[1], 10);
    const prevStep = Math.max(1, currentStep - 1);

    const progress = await getChecklistProgress(telegramId);
    const completed = parseStepsJson(progress?.completedSteps as string | null);
    const skipped = parseStepsJson(progress?.skippedSteps as string | null);

    await updateChecklistProgress(telegramId, prevStep, completed, skipped);
    await logAction(telegramId, "checklist_back", `step_${prevStep}`);
    await showStep(ctx, telegramId, prevStep, completed, skipped);
  });

  // Completion callback (from what-else keyboard)
  bot.callbackQuery("checklist_complete", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.replyWithChatAction("typing");
    const telegramId = ctx.from.id;

    const userName = await getUserName(telegramId);
    await ctx.reply(completionMessage(userName), {
      parse_mode: "HTML",
      reply_markup: completionKeyboard(),
    });
  });
}
