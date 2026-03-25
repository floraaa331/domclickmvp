import { InlineKeyboard, Keyboard } from "grammy";

/** Main reply keyboard menu */
export function mainMenuKeyboard(): Keyboard {
  return new Keyboard()
    .text("🏦 Ипотечный калькулятор")
    .text("🗺 Подобрать район")
    .row()
    .text("📝 Создать объявление")
    .text("✅ Чек-лист покупки")
    .resized()
    .persistent();
}

/** Back + Home navigation buttons */
export function navButtons(backCallback?: string): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (backCallback) {
    kb.text("← Назад", backCallback);
  }
  kb.text("🏠 В главное меню", "main_menu");
  return kb;
}

/** Post-action "What else?" keyboard */
export function whatElseKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🏦 Калькулятор", "calc_start")
    .text("🗺 Районы", "districts_start")
    .row()
    .text("📝 Объявление", "ad_start")
    .text("✅ Чек-лист", "checklist_start")
    .row()
    .text("🏠 В главное меню", "main_menu");
}
