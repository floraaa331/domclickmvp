import { Bot, InlineKeyboard, InputFile } from "grammy";
import type { Context } from "grammy";
import { Workbook } from "exceljs";

import {
  calculateAnnuity,
  calculateDifferentiated,
  generatePaymentSchedule,
  getDefaultRate,
} from "./calculator.service";
import {
  welcomeMessage,
  askPriceMessage,
  askDownPaymentMessage,
  askTermMessage,
  askRateMessage,
  resultMessage,
  comparisonMessage,
  errorParseAmount,
  errorDownPaymentTooHigh,
  errorRateInvalid,
} from "./calculator.messages";
import { parseAmount } from "../../utils/parser";
import { navButtons } from "../../utils/keyboard";
import { saveCalculation, logAction } from "../../db/prisma";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface CalculatorState {
  step:
    | "type"
    | "price"
    | "downpayment"
    | "downpayment_custom"
    | "term"
    | "rate"
    | "rate_custom"
    | "done";
  propertyType?: string;
  price?: number;
  downPayment?: number;
  termYears?: number;
  rate?: number;
}

const states = new Map<number, CalculatorState>();

function getState(userId: number): CalculatorState | undefined {
  return states.get(userId);
}

function setState(userId: number, state: CalculatorState): void {
  states.set(userId, state);
}

function clearState(userId: number): void {
  states.delete(userId);
}

// ---------------------------------------------------------------------------
// Keyboards
// ---------------------------------------------------------------------------

function propertyTypeKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🏗 Новостройка", "calc_type_new")
    .row()
    .text("🏠 Вторичное жильё", "calc_type_secondary")
    .row()
    .text("🏡 Загородный дом", "calc_type_house");
}

function downPaymentKeyboard(price: number): InlineKeyboard {
  return new InlineKeyboard()
    .text("10%", "calc_dp_10")
    .text("15%", "calc_dp_15")
    .text("20%", "calc_dp_20")
    .text("30%", "calc_dp_30")
    .row()
    .text("✏️ Своя сумма", "calc_dp_custom");
}

function termKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("5 лет", "calc_term_5")
    .text("10 лет", "calc_term_10")
    .row()
    .text("15 лет", "calc_term_15")
    .text("20 лет", "calc_term_20")
    .row()
    .text("25 лет", "calc_term_25")
    .text("30 лет", "calc_term_30");
}

function rateKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("✅ Использовать", "calc_rate_ok")
    .text("✏️ Ввести свою", "calc_rate_change");
}

function resultKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🔄 Пересчитать", "calc_restart")
    .text("📊 Сравнить платежи", "calc_compare")
    .row()
    .text("📋 График платежей", "calc_schedule")
    .text("🏠 В главное меню", "main_menu");
}

function afterCompareKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🔄 Пересчитать", "calc_restart")
    .text("📋 График платежей", "calc_schedule")
    .row()
    .text("🏠 В главное меню", "main_menu");
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function showResult(ctx: Context, userId: number): Promise<void> {
  const state = getState(userId);
  if (
    !state ||
    state.propertyType === undefined ||
    state.price === undefined ||
    state.downPayment === undefined ||
    state.termYears === undefined ||
    state.rate === undefined
  ) {
    return;
  }

  const loanAmount = state.price - state.downPayment;
  const result = calculateAnnuity(loanAmount, state.rate, state.termYears);

  state.step = "done";
  setState(userId, state);

  const text = resultMessage({
    propertyType: state.propertyType,
    price: state.price,
    downPayment: state.downPayment,
    termYears: state.termYears,
    rate: state.rate,
    result,
  });

  await ctx.reply(text, {
    parse_mode: "HTML",
    reply_markup: resultKeyboard(),
  });

  // Persist calculation & log
  try {
    await saveCalculation({
      telegramId: userId,
      propertyType: state.propertyType,
      propertyCost: state.price,
      downPayment: state.downPayment,
      termYears: state.termYears,
      rate: state.rate,
      monthlyPayment: result.monthlyPayment,
      totalPayment: result.totalPayment,
      overpayment: result.overpayment,
    });
    await logAction(userId, "calculator_result", `${state.propertyType} ${state.price}`);
  } catch {
    // DB errors should not break the bot
  }
}

// ---------------------------------------------------------------------------
// Exported text input handler (call from top-level message handler)
// ---------------------------------------------------------------------------

export async function handleCalculatorTextInput(ctx: Context): Promise<boolean> {
  const userId = ctx.from?.id;
  if (!userId) return false;

  const state = getState(userId);
  if (!state) return false;

  const text = ctx.message?.text?.trim();
  if (!text) return false;

  // ── Price step ──────────────────────────────────────────────────────────
  if (state.step === "price") {
    await ctx.api.sendChatAction(ctx.chat!.id, "typing");
    const amount = parseAmount(text);
    if (!amount || amount < 100_000) {
      await ctx.reply(errorParseAmount());
      return true;
    }

    state.price = amount;
    state.step = "downpayment";
    setState(userId, state);

    await ctx.reply(askDownPaymentMessage(amount), {
      parse_mode: "HTML",
      reply_markup: downPaymentKeyboard(amount),
    });
    return true;
  }

  // ── Custom down payment step ────────────────────────────────────────────
  if (state.step === "downpayment_custom") {
    await ctx.api.sendChatAction(ctx.chat!.id, "typing");
    const amount = parseAmount(text);
    if (!amount) {
      await ctx.reply(errorParseAmount());
      return true;
    }
    if (state.price !== undefined && amount >= state.price) {
      await ctx.reply(errorDownPaymentTooHigh());
      return true;
    }

    state.downPayment = amount;
    state.step = "term";
    setState(userId, state);

    await ctx.reply(askTermMessage(), {
      parse_mode: "HTML",
      reply_markup: termKeyboard(),
    });
    return true;
  }

  // ── Custom rate step ────────────────────────────────────────────────────
  if (state.step === "rate_custom") {
    await ctx.api.sendChatAction(ctx.chat!.id, "typing");
    const cleaned = text.replace(",", ".");
    const rate = parseFloat(cleaned);
    if (isNaN(rate) || rate < 0.1 || rate > 30) {
      await ctx.reply(errorRateInvalid());
      return true;
    }

    state.rate = rate;
    setState(userId, state);

    await showResult(ctx, userId);
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

export function setupCalculator(bot: Bot): void {
  // 1. Entry points
  const startCalculator = async (ctx: Context): Promise<void> => {
    const userId = ctx.from?.id;
    if (!userId || !ctx.chat) return;

    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    setState(userId, { step: "type" });

    await ctx.reply(welcomeMessage(), {
      parse_mode: "HTML",
      reply_markup: propertyTypeKeyboard(),
    });

    try {
      await logAction(userId, "calculator_start");
    } catch {
      // ignore
    }
  };

  bot.callbackQuery("calc_start", async (ctx) => {
    await ctx.answerCallbackQuery();
    await startCalculator(ctx);
  });

  bot.hears("🏦 Ипотечный калькулятор", async (ctx) => {
    await startCalculator(ctx);
  });

  // 2. Property type selection
  bot.callbackQuery(/^calc_type_/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    if (!ctx.chat) return;

    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    const typeKey = ctx.callbackQuery.data.replace("calc_type_", "");
    setState(userId, { step: "price", propertyType: typeKey });

    await ctx.reply(askPriceMessage(typeKey), { parse_mode: "HTML" });
  });

  // 3. Down payment percentage buttons
  bot.callbackQuery(/^calc_dp_/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    if (!ctx.chat) return;

    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    const state = getState(userId);
    if (!state || state.price === undefined) return;

    const value = ctx.callbackQuery.data.replace("calc_dp_", "");

    if (value === "custom") {
      state.step = "downpayment_custom";
      setState(userId, state);
      await ctx.reply("✏️ Введите сумму первоначального взноса:");
      return;
    }

    const percent = parseInt(value, 10);
    if (isNaN(percent)) return;

    state.downPayment = Math.round(state.price * (percent / 100));
    state.step = "term";
    setState(userId, state);

    await ctx.reply(askTermMessage(), {
      parse_mode: "HTML",
      reply_markup: termKeyboard(),
    });
  });

  // 4. Term selection
  bot.callbackQuery(/^calc_term_/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    if (!ctx.chat) return;

    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    const state = getState(userId);
    if (!state || !state.propertyType) return;

    const years = parseInt(ctx.callbackQuery.data.replace("calc_term_", ""), 10);
    if (isNaN(years)) return;

    state.termYears = years;
    state.step = "rate";
    setState(userId, state);

    const defaultRate = getDefaultRate(state.propertyType);

    await ctx.reply(askRateMessage(defaultRate, state.propertyType), {
      parse_mode: "HTML",
      reply_markup: rateKeyboard(),
    });
  });

  // 5. Use default rate
  bot.callbackQuery("calc_rate_ok", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    if (!ctx.chat) return;

    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    const state = getState(userId);
    if (!state || !state.propertyType) return;

    state.rate = getDefaultRate(state.propertyType);
    setState(userId, state);

    await showResult(ctx, userId);
  });

  // 6. Custom rate prompt
  bot.callbackQuery("calc_rate_change", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;

    const state = getState(userId);
    if (!state) return;

    state.step = "rate_custom";
    setState(userId, state);

    await ctx.reply("✏️ Введите ставку (например: 6.5):");
  });

  // 7. Compare annuity vs differentiated
  bot.callbackQuery("calc_compare", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    if (!ctx.chat) return;

    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    const state = getState(userId);
    if (
      !state ||
      state.price === undefined ||
      state.downPayment === undefined ||
      state.termYears === undefined ||
      state.rate === undefined ||
      state.propertyType === undefined
    ) {
      return;
    }

    const loanAmount = state.price - state.downPayment;
    const annuity = calculateAnnuity(loanAmount, state.rate, state.termYears);
    const differentiated = calculateDifferentiated(loanAmount, state.rate, state.termYears);

    const text = comparisonMessage(annuity, differentiated, {
      propertyType: state.propertyType,
      price: state.price,
      downPayment: state.downPayment,
      termYears: state.termYears,
      rate: state.rate,
    });

    await ctx.reply(text, {
      parse_mode: "HTML",
      reply_markup: afterCompareKeyboard(),
    });
  });

  // 8. Payment schedule as Excel document
  bot.callbackQuery("calc_schedule", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    if (!ctx.chat) return;

    await ctx.api.sendChatAction(ctx.chat.id, "upload_document");

    const state = getState(userId);
    if (
      !state ||
      state.price === undefined ||
      state.downPayment === undefined ||
      state.termYears === undefined ||
      state.rate === undefined
    ) {
      return;
    }

    const loanAmount = state.price - state.downPayment;
    const schedule = generatePaymentSchedule(
      loanAmount,
      state.rate,
      state.termYears,
      "annuity"
    );

    // Build Excel workbook
    const workbook = new Workbook();
    const sheet = workbook.addWorksheet("График платежей");

    // Header row
    const headerRow = sheet.addRow([
      "Месяц",
      "Платёж",
      "Тело долга",
      "Проценты",
      "Остаток",
    ]);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };

    // Column widths
    sheet.getColumn(1).width = 10;
    sheet.getColumn(2).width = 18;
    sheet.getColumn(3).width = 18;
    sheet.getColumn(4).width = 18;
    sheet.getColumn(5).width = 20;

    // Number format for currency columns
    const currencyFormat = "#,##0.00";

    for (const row of schedule) {
      const dataRow = sheet.addRow([
        row.month,
        row.payment,
        row.principalPart,
        row.interestPart,
        row.remainingDebt,
      ]);

      for (let col = 2; col <= 5; col++) {
        dataRow.getCell(col).numFmt = currencyFormat;
      }
    }

    // Write to buffer and send
    const buffer = await workbook.xlsx.writeBuffer();

    await ctx.replyWithDocument(
      new InputFile(Buffer.from(buffer as ArrayBuffer), `mortgage_schedule_${state.termYears}y_${state.rate}pct.xlsx`),
      {
        caption: `📋 График аннуитетных платежей на ${state.termYears} лет`,
      }
    );
  });

  // 9. Restart calculator
  bot.callbackQuery("calc_restart", async (ctx) => {
    await ctx.answerCallbackQuery();
    await startCalculator(ctx);
  });
}
