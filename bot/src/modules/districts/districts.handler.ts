import { Bot, InlineKeyboard } from "grammy";
import { District, districts } from "../../data/districts";
import { navButtons, whatElseKeyboard } from "../../utils/keyboard";
import { logAction } from "../../db/prisma";
import {
  findBestDistricts,
  compareDistricts,
  getDistrictDetails,
  Criterion,
  Budget,
} from "./districts.service";
import {
  criteriaSelectionMessage,
  budgetMessage,
  resultsMessage,
  districtDetailMessage,
  comparisonMessage,
} from "./districts.messages";

interface DistrictsState {
  step: "criteria" | "budget" | "results" | "compare_select";
  selectedCriteria: Criterion[];
  budget?: Budget;
  results?: District[];
  compareFirst?: string;
}

const userStates = new Map<number, DistrictsState>();

const ALL_CRITERIA: Criterion[] = [
  "metro",
  "ecology",
  "schools",
  "shops",
  "quiet",
  "prices",
  "newBuildings",
];

const CRITERIA_BUTTON_LABELS: Record<Criterion, string> = {
  metro: "🚇 Метро",
  ecology: "🌳 Экология",
  schools: "🏫 Школы",
  shops: "🛒 Магазины",
  quiet: "🤫 Тишина",
  prices: "💰 Цены",
  newBuildings: "🏗 Новостройки",
};

function getOrCreateState(userId: number): DistrictsState {
  let state = userStates.get(userId);
  if (!state) {
    state = { step: "criteria", selectedCriteria: [] };
    userStates.set(userId, state);
  }
  return state;
}

function resetState(userId: number): DistrictsState {
  const state: DistrictsState = { step: "criteria", selectedCriteria: [] };
  userStates.set(userId, state);
  return state;
}

function buildCriteriaKeyboard(selected: Criterion[]): InlineKeyboard {
  const kb = new InlineKeyboard();

  for (let i = 0; i < ALL_CRITERIA.length; i++) {
    const c = ALL_CRITERIA[i];
    const check = selected.includes(c) ? "✅ " : "";
    kb.text(`${check}${CRITERIA_BUTTON_LABELS[c]}`, `dist_toggle_${c}`);
    if (i % 2 === 1) kb.row();
  }

  if (ALL_CRITERIA.length % 2 === 1) kb.row();

  kb.text("✅ Готово — подобрать", "dist_criteria_done").row();
  kb.text("🏠 В главное меню", "main_menu");

  return kb;
}

function buildBudgetKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🟢 Эконом (до 250к)", "dist_budget_low")
    .row()
    .text("🟡 Комфорт (до 350к)", "dist_budget_medium")
    .row()
    .text("🟠 Бизнес (до 500к)", "dist_budget_high")
    .row()
    .text("🔴 Премиум (любой)", "dist_budget_premium")
    .row()
    .text("← Назад", "districts_start")
    .text("🏠 В главное меню", "main_menu");
}

function buildResultsKeyboard(resultDistricts: District[]): InlineKeyboard {
  const kb = new InlineKeyboard();

  for (const district of resultDistricts) {
    kb.text(`📍 ${district.name}`, `dist_detail_${district.name}`).row();
  }

  if (resultDistricts.length >= 2) {
    kb.text("⚖️ Сравнить районы", "dist_compare").row();
  }

  kb.text("🔄 Подобрать заново", "dist_restart").row();
  kb.text("🏠 В главное меню", "main_menu");

  return kb;
}

function buildCompareKeyboard(
  resultDistricts: District[],
  selectedFirst?: string
): InlineKeyboard {
  const kb = new InlineKeyboard();

  for (const district of resultDistricts) {
    const prefix = district.name === selectedFirst ? "✅ " : "";
    kb.text(
      `${prefix}${district.name}`,
      `dist_compare_${district.name}`
    ).row();
  }

  kb.text("← Назад к результатам", "dist_back_results").row();
  kb.text("🏠 В главное меню", "main_menu");

  return kb;
}

function buildDetailKeyboard(districtName: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("← Назад к результатам", "dist_back_results")
    .row()
    .text("🔄 Подобрать заново", "dist_restart")
    .text("🏠 В главное меню", "main_menu");
}

export function setupDistricts(bot: Bot): void {
  // Start from text button
  bot.hears("🗺 Подобрать район", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    await ctx.replyWithChatAction("typing");

    const state = resetState(userId);

    await logAction(userId, "districts_start");

    await ctx.reply(criteriaSelectionMessage(state.selectedCriteria), {
      reply_markup: buildCriteriaKeyboard(state.selectedCriteria),
    });
  });

  // Start from inline callback
  bot.callbackQuery("districts_start", async (ctx) => {
    const userId = ctx.from.id;

    await ctx.answerCallbackQuery();

    const state = resetState(userId);

    await logAction(userId, "districts_start");

    await ctx.editMessageText(
      criteriaSelectionMessage(state.selectedCriteria),
      { reply_markup: buildCriteriaKeyboard(state.selectedCriteria) }
    );
  });

  // Toggle criteria
  for (const criterion of ALL_CRITERIA) {
    bot.callbackQuery(`dist_toggle_${criterion}`, async (ctx) => {
      const userId = ctx.from.id;

      await ctx.answerCallbackQuery();

      const state = getOrCreateState(userId);
      state.step = "criteria";

      const index = state.selectedCriteria.indexOf(criterion);
      if (index >= 0) {
        state.selectedCriteria.splice(index, 1);
      } else {
        state.selectedCriteria.push(criterion);
      }

      await ctx.editMessageText(
        criteriaSelectionMessage(state.selectedCriteria),
        { reply_markup: buildCriteriaKeyboard(state.selectedCriteria) }
      );
    });
  }

  // Criteria done -> budget selection
  bot.callbackQuery("dist_criteria_done", async (ctx) => {
    const userId = ctx.from.id;
    const state = getOrCreateState(userId);

    if (state.selectedCriteria.length === 0) {
      await ctx.answerCallbackQuery({
        text: "Выбери хотя бы один критерий!",
        show_alert: true,
      });
      return;
    }

    await ctx.answerCallbackQuery();

    state.step = "budget";

    await logAction(
      userId,
      "districts_criteria",
      state.selectedCriteria.join(", ")
    );

    await ctx.editMessageText(budgetMessage(), {
      reply_markup: buildBudgetKeyboard(),
    });
  });

  // Budget selection callbacks
  const budgetOptions: Budget[] = ["low", "medium", "high", "premium"];

  for (const budget of budgetOptions) {
    bot.callbackQuery(`dist_budget_${budget}`, async (ctx) => {
      const userId = ctx.from.id;

      await ctx.answerCallbackQuery();

      const state = getOrCreateState(userId);
      state.budget = budget;
      state.step = "results";

      await logAction(userId, "districts_budget", budget);

      const bestDistricts = findBestDistricts(
        state.selectedCriteria,
        budget
      );
      state.results = bestDistricts;

      await ctx.editMessageText(
        resultsMessage(bestDistricts, state.selectedCriteria),
        { reply_markup: buildResultsKeyboard(bestDistricts) }
      );
    });
  }

  // District detail
  bot.callbackQuery(/^dist_detail_(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const districtName = ctx.match[1];

    await ctx.answerCallbackQuery();

    const district = getDistrictDetails(districtName);
    if (!district) {
      await ctx.editMessageText("Район не найден.", {
        reply_markup: navButtons("dist_back_results"),
      });
      return;
    }

    await logAction(userId, "districts_detail", districtName);

    await ctx.editMessageText(districtDetailMessage(district), {
      reply_markup: buildDetailKeyboard(districtName),
    });
  });

  // Enter comparison mode
  bot.callbackQuery("dist_compare", async (ctx) => {
    const userId = ctx.from.id;

    await ctx.answerCallbackQuery();

    const state = getOrCreateState(userId);
    state.step = "compare_select";
    state.compareFirst = undefined;

    const resultDistricts = state.results ?? [];

    await ctx.editMessageText(
      "⚖️ Сравнение районов\n\nВыбери первый район для сравнения:",
      { reply_markup: buildCompareKeyboard(resultDistricts) }
    );
  });

  // Select district to compare
  bot.callbackQuery(/^dist_compare_(.+)$/, async (ctx) => {
    const userId = ctx.from.id;
    const districtName = ctx.match[1];

    await ctx.answerCallbackQuery();

    const state = getOrCreateState(userId);
    const resultDistricts = state.results ?? [];

    if (!state.compareFirst) {
      // First district selected
      state.compareFirst = districtName;

      await ctx.editMessageText(
        `⚖️ Сравнение районов\n\nПервый: ${districtName}\nТеперь выбери второй район:`,
        { reply_markup: buildCompareKeyboard(resultDistricts, districtName) }
      );
    } else {
      // Second district selected
      if (state.compareFirst === districtName) {
        await ctx.answerCallbackQuery({
          text: "Выбери другой район для сравнения!",
          show_alert: true,
        });
        return;
      }

      const pair = compareDistricts(state.compareFirst, districtName);
      if (!pair) {
        await ctx.editMessageText("Не удалось найти один из районов.", {
          reply_markup: navButtons("dist_back_results"),
        });
        return;
      }

      const [d1, d2] = pair;

      await logAction(
        userId,
        "districts_compare",
        `${d1.name} vs ${d2.name}`
      );

      const kb = new InlineKeyboard()
        .text(`📍 ${d1.name}`, `dist_detail_${d1.name}`)
        .text(`📍 ${d2.name}`, `dist_detail_${d2.name}`)
        .row()
        .text("← Назад к результатам", "dist_back_results")
        .row()
        .text("🔄 Подобрать заново", "dist_restart")
        .text("🏠 В главное меню", "main_menu");

      await ctx.editMessageText(comparisonMessage(d1, d2), {
        reply_markup: kb,
      });
    }
  });

  // Back to results
  bot.callbackQuery("dist_back_results", async (ctx) => {
    const userId = ctx.from.id;

    await ctx.answerCallbackQuery();

    const state = getOrCreateState(userId);
    state.step = "results";

    const resultDistricts = state.results ?? [];

    await ctx.editMessageText(
      resultsMessage(resultDistricts, state.selectedCriteria),
      { reply_markup: buildResultsKeyboard(resultDistricts) }
    );
  });

  // Restart from scratch
  bot.callbackQuery("dist_restart", async (ctx) => {
    const userId = ctx.from.id;

    await ctx.answerCallbackQuery();

    const state = resetState(userId);

    await logAction(userId, "districts_restart");

    await ctx.editMessageText(
      criteriaSelectionMessage(state.selectedCriteria),
      { reply_markup: buildCriteriaKeyboard(state.selectedCriteria) }
    );
  });
}
