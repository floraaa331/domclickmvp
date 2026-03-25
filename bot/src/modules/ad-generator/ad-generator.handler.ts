import { Bot, Context } from "grammy";
import { parseAmount, parseFloor, parseArea } from "../../utils/parser";
import { logAction } from "../../db/prisma";
import { generateLaconicAd, generateSellingAd, AdParams } from "./ad-generator.service";
import {
  askDealTypeMessage,
  askPropertyTypeMessage,
  askRoomsMessage,
  askAreaMessage,
  askFloorMessage,
  askDistrictMessage,
  askFeaturesMessage,
  askPriceMessage,
  resultMessage,
  errorAreaMessage,
  errorFloorMessage,
  errorPriceMessage,
  getAvailableFeatures,
} from "./ad-generator.messages";

type AdStep =
  | "dealType"
  | "propertyType"
  | "rooms"
  | "area"
  | "floor"
  | "district"
  | "features"
  | "price"
  | "done";

interface AdState {
  step: AdStep;
  dealType?: "sale" | "rent";
  propertyType?: string;
  rooms?: string;
  area?: number;
  floor?: number;
  totalFloors?: number;
  district?: string;
  features: string[];
  price?: number;
  lastLaconic?: string;
  lastSelling?: string;
}

const userStates = new Map<number, AdState>();

function getState(userId: number): AdState {
  let state = userStates.get(userId);
  if (!state) {
    state = { step: "dealType", features: [] };
    userStates.set(userId, state);
  }
  return state;
}

function resetState(userId: number): AdState {
  const state: AdState = { step: "dealType", features: [] };
  userStates.set(userId, state);
  return state;
}

/** Check if the user is currently in the ad generator flow */
export function isInAdFlow(userId: number): boolean {
  const state = userStates.get(userId);
  return state !== undefined && state.step !== "done";
}

async function startFlow(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  if (!userId) return;

  resetState(userId);
  const { text, keyboard } = askDealTypeMessage();
  await ctx.reply(text, { reply_markup: keyboard });
  await logAction(userId, "ad_generator_start").catch(() => {});
}

async function sendFeaturesStep(ctx: Context, userId: number): Promise<void> {
  const state = getState(userId);
  const { text, keyboard } = askFeaturesMessage(state.features);
  await ctx.reply(text, { reply_markup: keyboard });
}

async function generateAndSendResult(ctx: Context, userId: number): Promise<void> {
  const state = getState(userId);

  const params: AdParams = {
    dealType: state.dealType!,
    propertyType: state.propertyType!,
    rooms: state.rooms!,
    area: state.area!,
    floor: state.floor!,
    totalFloors: state.totalFloors!,
    district: state.district!,
    features: state.features,
    price: state.price!,
  };

  const laconic = generateLaconicAd(params);
  const selling = generateSellingAd(params);

  state.lastLaconic = laconic;
  state.lastSelling = selling;
  state.step = "done";

  const { text, keyboard } = resultMessage(laconic, selling);
  await ctx.reply(text, { reply_markup: keyboard });
  await logAction(userId, "ad_generator_complete", `${state.dealType}_${state.rooms}`).catch(() => {});
}

export function setupAdGenerator(bot: Bot): void {
  // Start flow from reply keyboard or inline button
  bot.hears("📝 Создать объявление", async (ctx) => {
    await ctx.replyWithChatAction("typing");
    await startFlow(ctx);
  });

  bot.callbackQuery("ad_start", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.replyWithChatAction("typing");
    await startFlow(ctx);
  });

  // Deal type selection
  bot.callbackQuery(/^ad_deal_(sale|rent)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    const state = getState(userId);
    state.dealType = ctx.match![1] as "sale" | "rent";
    state.step = "propertyType";

    const { text, keyboard } = askPropertyTypeMessage();
    await ctx.reply(text, { reply_markup: keyboard });
  });

  // Property type selection
  bot.callbackQuery(/^ad_proptype_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    const state = getState(userId);
    state.propertyType = ctx.match![1];
    state.step = "rooms";

    const { text, keyboard } = askRoomsMessage();
    await ctx.reply(text, { reply_markup: keyboard });
  });

  // Room count selection
  bot.callbackQuery(/^ad_rooms_(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    const state = getState(userId);
    state.rooms = ctx.match![1];
    state.step = "area";

    await ctx.reply(askAreaMessage());
  });

  // Feature toggle
  bot.callbackQuery(/^ad_feature_toggle_(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    const state = getState(userId);
    const featureIndex = parseInt(ctx.match![1], 10);
    const allFeatures = getAvailableFeatures();

    if (featureIndex < 0 || featureIndex >= allFeatures.length) return;

    const feature = allFeatures[featureIndex];
    const idx = state.features.indexOf(feature);
    if (idx >= 0) {
      state.features.splice(idx, 1);
    } else {
      state.features.push(feature);
    }

    // Update the message in place
    const { text, keyboard } = askFeaturesMessage(state.features);
    await ctx.editMessageText(text, { reply_markup: keyboard });
  });

  // Features done
  bot.callbackQuery("ad_features_done", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    const state = getState(userId);
    state.step = "price";

    await ctx.reply(askPriceMessage());
  });

  // Copy buttons
  bot.callbackQuery("ad_copy_laconic", async (ctx) => {
    await ctx.answerCallbackQuery("Скопируй текст ниже");
    const userId = ctx.from.id;
    const state = userStates.get(userId);
    if (state?.lastLaconic) {
      await ctx.reply(state.lastLaconic);
    }
  });

  bot.callbackQuery("ad_copy_selling", async (ctx) => {
    await ctx.answerCallbackQuery("Скопируй текст ниже");
    const userId = ctx.from.id;
    const state = userStates.get(userId);
    if (state?.lastSelling) {
      await ctx.reply(state.lastSelling);
    }
  });

  // Edit price — go back to price step
  bot.callbackQuery("ad_edit_price", async (ctx) => {
    await ctx.answerCallbackQuery();
    const userId = ctx.from.id;
    const state = getState(userId);
    state.step = "price";

    await ctx.reply(askPriceMessage());
  });
}

/**
 * Handle text input for the current ad generator step.
 * Returns true if the message was consumed, false otherwise.
 */
export async function handleAdTextInput(ctx: Context): Promise<boolean> {
  const userId = ctx.from?.id;
  if (!userId) return false;

  const state = userStates.get(userId);
  if (!state) return false;

  const text = ctx.message?.text?.trim();
  if (!text) return false;

  switch (state.step) {
    case "area": {
      const area = parseArea(text);
      if (area === null) {
        await ctx.reply(errorAreaMessage());
        return true;
      }
      state.area = area;
      state.step = "floor";
      await ctx.reply(askFloorMessage());
      return true;
    }

    case "floor": {
      const floorData = parseFloor(text);
      if (floorData === null) {
        await ctx.reply(errorFloorMessage());
        return true;
      }
      state.floor = floorData.floor;
      state.totalFloors = floorData.totalFloors;
      state.step = "district";
      await ctx.reply(askDistrictMessage());
      return true;
    }

    case "district": {
      state.district = text;
      state.step = "features";
      await sendFeaturesStep(ctx, userId);
      return true;
    }

    case "price": {
      const price = parseAmount(text);
      if (price === null) {
        await ctx.reply(errorPriceMessage());
        return true;
      }
      state.price = price;
      await ctx.replyWithChatAction("typing");
      await generateAndSendResult(ctx, userId);
      return true;
    }

    default:
      return false;
  }
}
