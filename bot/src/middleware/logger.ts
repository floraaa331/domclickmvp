import { Context, NextFunction } from "grammy";

export async function loggerMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  const start = Date.now();
  const userId = ctx.from?.id ?? "unknown";
  const type = ctx.update ? Object.keys(ctx.update).filter(k => k !== "update_id")[0] ?? "unknown" : "unknown";
  const text = ctx.message?.text?.slice(0, 50) ?? ctx.callbackQuery?.data ?? "";

  console.log(`[→] ${type} from ${userId}: ${text}`);

  await next();

  const elapsed = Date.now() - start;
  console.log(`[←] ${type} from ${userId} (${elapsed}ms)`);
}
