import { Bot, Context, InlineKeyboard } from "grammy";
import { loggerMiddleware } from "./middleware/logger";
import { authMiddleware } from "./middleware/auth";
import { setupErrorHandler } from "./middleware/error-handler";
import { mainMenuKeyboard } from "./utils/keyboard";
import { getUserName, setUserName, getUserStats, logAction } from "./db/prisma";
import { getRandomTip } from "./data/tips";
import { formatCurrency, SEPARATOR } from "./utils/formatter";
import { setupCalculator, handleCalculatorTextInput } from "./modules/calculator/calculator.handler";
import { setupDistricts } from "./modules/districts/districts.handler";
import { setupAdGenerator, handleAdTextInput } from "./modules/ad-generator/ad-generator.handler";
import { setupChecklist } from "./modules/checklist/checklist.handler";

/** Users awaiting name input */
const awaitingName = new Set<number>();

export function createBot(token: string): Bot {
  const bot = new Bot(token);

  // Middleware
  bot.use(loggerMiddleware);
  bot.use(authMiddleware);

  // Error handler
  setupErrorHandler(bot);

  // /start command
  bot.command("start", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    await ctx.api.sendChatAction(ctx.chat.id, "typing");
    await logAction(userId, "start");

    const existingName = await getUserName(userId);

    if (!existingName) {
      awaitingName.add(userId);
      await ctx.reply(
        "🏠🏠🏠🏠🏠🏠🏠🏠🏠\n\n" +
        "🔷  <b>Domclick Assistant</b>  🔷\n\n" +
        "🏠🏠🏠🏠🏠🏠🏠🏠🏠\n\n" +
        "Привет! Я — твой AI-помощник по недвижимости.\n\n" +
        "Для начала, как тебя зовут? 😊",
        { parse_mode: "HTML" }
      );
      return;
    }

    await sendMainMenu(ctx, existingName);
  });

  // /help command
  bot.command("help", async (ctx) => {
    await ctx.reply(
      "📖 <b>Возможности бота</b>\n\n" +
      "🏦 <b>/calc</b> — Ипотечный калькулятор\n" +
      "Рассчитай ежемесячный платёж, сравни аннуитет и дифференцированный, получи график платежей\n\n" +
      "🗺 <b>/districts</b> — Подбор района\n" +
      "Подберём лучший район Москвы по твоим критериям и бюджету\n\n" +
      "📝 <b>/ad</b> — Генератор объявления\n" +
      "Создадим продающее объявление о продаже или аренде\n\n" +
      "✅ <b>/checklist</b> — Чек-лист покупки\n" +
      "Пошаговый гид по покупке квартиры с сохранением прогресса\n\n" +
      "📊 <b>/stats</b> — Твоя статистика\n\n" +
      SEPARATOR + "\n" +
      "Выбери нужный пункт в меню или используй команды 👆",
      { parse_mode: "HTML", reply_markup: mainMenuKeyboard() }
    );
  });

  // /stats command
  bot.command("stats", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    await ctx.api.sendChatAction(ctx.chat.id, "typing");
    const user = await getUserStats(userId);
    if (!user) {
      await ctx.reply("Начни с /start, чтобы я тебя запомнил 😊");
      return;
    }

    const calcCount = user.calculations.length;
    const lastCalc = user.calculations[0];
    const checkStep = user.checklistProgress?.currentStep ?? 0;

    let text = `📊 <b>Твоя статистика</b>\n\n`;
    text += `👤 Имя: ${user.customName ?? user.firstName ?? "Не указано"}\n`;
    text += `📅 С нами с: ${user.createdAt.toLocaleDateString("ru-RU")}\n`;
    text += `🧮 Расчётов ипотеки: ${calcCount}\n`;

    if (lastCalc) {
      text += `\n💰 Последний расчёт:\n`;
      text += `   ${formatCurrency(lastCalc.propertyCost)} → ${formatCurrency(lastCalc.monthlyPayment)}/мес\n`;
    }

    if (checkStep > 0) {
      text += `\n✅ Чек-лист покупки: шаг ${checkStep} из 10\n`;
    }

    await ctx.reply(text, { parse_mode: "HTML", reply_markup: mainMenuKeyboard() });
  });

  // Quick commands
  bot.command("calc", async (ctx) => {
    await ctx.api.sendChatAction(ctx.chat.id, "typing");
    const kb = new InlineKeyboard()
      .text("🏗 Новостройка", "calc_type_new")
      .text("🏘 Вторичка", "calc_type_secondary")
      .row()
      .text("🏡 Загородный дом", "calc_type_house")
      .row()
      .text("🏠 В главное меню", "main_menu");

    await ctx.reply(
      "🏦 <b>Ипотечный калькулятор</b>\n\nКакой тип жилья рассматриваешь?",
      { parse_mode: "HTML", reply_markup: kb }
    );
  });

  bot.command("districts", async (ctx) => {
    // Trigger the districts flow
    ctx.callbackQuery = { data: "districts_start" } as never;
    await bot.handleUpdate({
      update_id: 0,
      callback_query: {
        id: "0",
        chat_instance: "0",
        from: ctx.from!,
        message: ctx.message,
        data: "districts_start",
      },
    });
  });

  bot.command("ad", async (ctx) => {
    ctx.callbackQuery = { data: "ad_start" } as never;
    await bot.handleUpdate({
      update_id: 0,
      callback_query: {
        id: "0",
        chat_instance: "0",
        from: ctx.from!,
        message: ctx.message,
        data: "ad_start",
      },
    });
  });

  bot.command("checklist", async (ctx) => {
    ctx.callbackQuery = { data: "checklist_start" } as never;
    await bot.handleUpdate({
      update_id: 0,
      callback_query: {
        id: "0",
        chat_instance: "0",
        from: ctx.from!,
        message: ctx.message,
        data: "checklist_start",
      },
    });
  });

  // Main menu callback
  bot.callbackQuery("main_menu", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    const name = await getUserName(userId);
    await ctx.reply(
      `🏠 <b>Главное меню</b>\n\n${name ? name + ", ч" : "Ч"}то хочешь сделать?\n\n${getRandomTip()}`,
      { parse_mode: "HTML", reply_markup: mainMenuKeyboard() }
    );
  });

  // Setup modules
  setupCalculator(bot);
  setupDistricts(bot);
  setupAdGenerator(bot);
  setupChecklist(bot);

  // Text message handler — route to the right module or handle name input
  bot.on("message:text", async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    // Handle name input
    if (awaitingName.has(userId)) {
      awaitingName.delete(userId);
      const name = text.trim().slice(0, 50);
      await setUserName(userId, name);
      await sendMainMenu(ctx, name);
      return;
    }

    // Route main menu keyboard presses
    if (text === "🏦 Ипотечный калькулятор" || text === "🗺 Подобрать район" ||
        text === "📝 Создать объявление" || text === "✅ Чек-лист покупки") {
      // These are handled by bot.hears() in the modules
      return;
    }

    // Try module text handlers
    const calcHandled = await handleCalculatorTextInput(ctx);
    if (calcHandled) return;

    const adHandled = await handleAdTextInput(ctx);
    if (adHandled) return;

    // Default — show help hint
    const name = await getUserName(userId);
    await ctx.reply(
      `${name ? name + ", я" : "Я"} пока не понял команду 🤔\nВоспользуйся кнопками меню или набери /help`,
      { reply_markup: mainMenuKeyboard() }
    );
  });

  return bot;
}

async function sendMainMenu(
  ctx: Context,
  name: string
): Promise<void> {
  const tip = getRandomTip();
  await ctx.reply(
    "🏠🏠🏠🏠🏠🏠🏠🏠🏠\n\n" +
    "🔷  <b>Domclick Assistant</b>  🔷\n\n" +
    "🏠🏠🏠🏠🏠🏠🏠🏠🏠\n\n" +
    `Привет, <b>${name}</b>! 👋\n\n` +
    "Я помогу рассчитать ипотеку, подобрать район, составить объявление и провести через весь процесс покупки квартиры.\n\n" +
    "Выбери, с чего начнём:\n\n" +
    `${tip}`,
    { parse_mode: "HTML", reply_markup: mainMenuKeyboard() }
  );
}
