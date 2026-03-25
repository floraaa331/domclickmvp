import { Context, NextFunction } from "grammy";
import { getOrCreateUser } from "../db/prisma";

export async function authMiddleware(ctx: Context, next: NextFunction): Promise<void> {
  if (ctx.from) {
    await getOrCreateUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );
  }
  await next();
}
