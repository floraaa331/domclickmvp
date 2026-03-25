import { Bot, BotError, Context } from "grammy";

export function setupErrorHandler(bot: Bot): void {
  bot.catch(async (err: BotError) => {
    const ctx = err.ctx;
    const e = err.error;

    console.error(`[ERROR] Update ${ctx.update.update_id}:`, e);

    try {
      if (ctx.chat) {
        await ctx.reply(
          "😔 Произошла непредвиденная ошибка. Попробуй ещё раз или нажми /start для возврата в меню.",
          { parse_mode: "HTML" }
        );
      }
    } catch (replyError) {
      console.error("[ERROR] Failed to send error message:", replyError);
    }
  });
}
