import { InlineKeyboard } from "grammy";
import { SEPARATOR } from "../../utils/formatter";

const ALL_FEATURES = [
  "Лифт",
  "Парковка",
  "Панорамные окна",
  "Ремонт",
  "Два санузла",
  "Фитнес в доме",
  "Детская площадка",
  "Вид из окна",
] as const;

export type FeatureName = (typeof ALL_FEATURES)[number];

export function getAvailableFeatures(): readonly string[] {
  return ALL_FEATURES;
}

export function askDealTypeMessage(): { text: string; keyboard: InlineKeyboard } {
  return {
    text: "Создадим объявление! Продажа или аренда?",
    keyboard: new InlineKeyboard()
      .text("Продажа", "ad_deal_sale")
      .text("Аренда", "ad_deal_rent"),
  };
}

export function askPropertyTypeMessage(): { text: string; keyboard: InlineKeyboard } {
  return {
    text: "Выбери тип недвижимости:",
    keyboard: new InlineKeyboard()
      .text("Квартира", "ad_proptype_apartment")
      .text("Студия", "ad_proptype_studio")
      .row()
      .text("Апартаменты", "ad_proptype_apart")
      .text("Комната", "ad_proptype_room"),
  };
}

export function askRoomsMessage(): { text: string; keyboard: InlineKeyboard } {
  return {
    text: "Сколько комнат?",
    keyboard: new InlineKeyboard()
      .text("Студия", "ad_rooms_studio")
      .text("1", "ad_rooms_1")
      .text("2", "ad_rooms_2")
      .row()
      .text("3", "ad_rooms_3")
      .text("4+", "ad_rooms_4+"),
  };
}

export function askAreaMessage(): string {
  return "Укажи площадь в м² (например: 65)";
}

export function askFloorMessage(): string {
  return "Укажи этаж и этажность, например: 5/17";
}

export function askDistrictMessage(): string {
  return "Укажи район или станцию метро";
}

export function askFeaturesMessage(selected: string[]): {
  text: string;
  keyboard: InlineKeyboard;
} {
  const keyboard = new InlineKeyboard();

  for (let i = 0; i < ALL_FEATURES.length; i++) {
    const feature = ALL_FEATURES[i];
    const isSelected = selected.includes(feature);
    const label = isSelected ? `${feature} ✅` : feature;
    keyboard.text(label, `ad_feature_toggle_${i}`);
    if (i % 2 === 1) keyboard.row();
  }

  keyboard.row().text("Готово ➡️", "ad_features_done");

  const selectedText =
    selected.length > 0
      ? `\nВыбрано: ${selected.join(", ")}`
      : "\nПока ничего не выбрано";

  return {
    text: `Выбери особенности (можно несколько):${selectedText}`,
    keyboard,
  };
}

export function askPriceMessage(): string {
  return "Укажи цену (например: 15млн, 50000, 80к)";
}

export function resultMessage(laconic: string, selling: string): {
  text: string;
  keyboard: InlineKeyboard;
} {
  const text = [
    "📝 ОБЪЯВЛЕНИЕ ГОТОВО!",
    "",
    `${SEPARATOR} Вариант 1: Лаконичный ${SEPARATOR}`,
    laconic,
    "",
    `${SEPARATOR} Вариант 2: Продающий ${SEPARATOR}`,
    selling,
  ].join("\n");

  const keyboard = new InlineKeyboard()
    .text("📋 Скопировать лаконичный", "ad_copy_laconic")
    .row()
    .text("📋 Скопировать продающий", "ad_copy_selling")
    .row()
    .text("✏️ Изменить цену", "ad_edit_price")
    .text("🔄 Новое объявление", "ad_start")
    .row()
    .text("🏠 В главное меню", "main_menu");

  return { text, keyboard };
}

export function errorAreaMessage(): string {
  return "Не могу разобрать площадь. Укажи число, например: 65 или 42.5";
}

export function errorFloorMessage(): string {
  return "Неверный формат. Укажи этаж/этажность, например: 5/17";
}

export function errorPriceMessage(): string {
  return "Не могу разобрать цену. Попробуй: 15000000, 15млн, 500к";
}
