import { progressBar, SEPARATOR } from "../../utils/formatter";
import type { ChecklistStep } from "./checklist.service";

/** Welcome message when starting the checklist */
export function checklistWelcomeMessage(userName: string | null): string {
  const greeting = userName ? `, ${userName}` : "";
  return [
    "✅ <b>Чек-лист покупки квартиры</b>",
    "",
    `Привет${greeting}! Этот чек-лист проведёт тебя через все этапы покупки квартиры — от определения бюджета до получения ключей.`,
    "",
    "📌 <b>10 шагов</b> — ничего не забудешь",
    "💡 <b>Советы</b> — на каждом этапе",
    "📄 <b>Документы</b> — что подготовить",
    "📊 <b>Прогресс</b> — сохраняется автоматически",
    "",
    SEPARATOR,
    "",
    "Можно проходить шаги по порядку или пропускать те, которые уже выполнены.",
    "",
    "Готов начать? 👇",
  ].join("\n");
}

/** Message when user has existing progress */
export function resumeMessage(
  stepNumber: number,
  userName: string | null
): string {
  const greeting = userName ? `, ${userName}` : "";
  return [
    "✅ <b>Чек-лист покупки квартиры</b>",
    "",
    `С возвращением${greeting}! Ты остановился на шаге ${stepNumber} из 10.`,
    "",
    "Продолжим с того места или начнём сначала?",
  ].join("\n");
}

/** Format a single step with progress, description, tips, and documents */
export function stepMessage(
  step: ChecklistStep,
  completed: number[],
  skipped: number[]
): string {
  const total = 10;
  const done = completed.length + skipped.length;
  const bar = progressBar(done, total);

  const lines: string[] = [
    "✅ <b>Чек-лист покупки квартиры</b>",
    "",
    bar,
    "",
    SEPARATOR,
    "",
    `${step.emoji} <b>Шаг ${step.number}: ${step.title}</b>`,
    "",
    step.description,
    "",
  ];

  // Show step status
  if (completed.includes(step.number)) {
    lines.push("✅ <i>Этот шаг выполнен</i>", "");
  } else if (skipped.includes(step.number)) {
    lines.push("⏭ <i>Этот шаг пропущен</i>", "");
  }

  // Tips section
  lines.push("💡 <b>Советы:</b>");
  for (const tip of step.tips) {
    lines.push(`  • ${tip}`);
  }
  lines.push("");

  // Documents section (if available)
  if (step.documents && step.documents.length > 0) {
    lines.push("📄 <b>Документы для проверки:</b>");
    for (const doc of step.documents) {
      lines.push(`  • ${doc}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/** Congratulations message when all steps are done */
export function completionMessage(userName: string | null): string {
  const bar = progressBar(10, 10);
  const greeting = userName ? `, ${userName}` : "";
  return [
    `🎉 <b>Поздравляем${greeting}!</b>`,
    "",
    bar,
    "",
    SEPARATOR,
    "",
    "Ты прошёл все 10 шагов чек-листа покупки квартиры!",
    "",
    "🏠 Надеемся, что наш чек-лист помог тебе не упустить ничего важного " +
      "на пути к собственному жилью.",
    "",
    "💡 <b>Полезные напоминания:</b>",
    "  • Не забудь подать на налоговый вычет",
    "  • Переоформи все лицевые счета ЖКХ",
    "  • Сохрани все документы по сделке в надёжном месте",
    "",
    SEPARATOR,
    "",
    "Что ещё могу помочь?",
  ].join("\n");
}

/** Expanded tips view for a step */
export function tipsDetailMessage(step: ChecklistStep): string {
  const lines: string[] = [
    `💡 <b>Подробные советы — Шаг ${step.number}</b>`,
    `${step.emoji} <b>${step.title}</b>`,
    "",
    SEPARATOR,
    "",
  ];

  step.tips.forEach((tip, index) => {
    lines.push(`<b>${index + 1}.</b> ${tip}`);
    lines.push("");
  });

  if (step.documents && step.documents.length > 0) {
    lines.push(SEPARATOR, "");
    lines.push("📄 <b>Необходимые документы:</b>", "");
    step.documents.forEach((doc, index) => {
      lines.push(`  ${index + 1}. ${doc}`);
    });
    lines.push("");
  }

  return lines.join("\n");
}
