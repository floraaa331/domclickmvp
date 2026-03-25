import "dotenv/config";
import { createBot } from "./bot";

async function main(): Promise<void> {
  const token = process.env.BOT_TOKEN;
  if (!token) {
    console.error("❌ BOT_TOKEN не указан в .env файле");
    process.exit(1);
  }

  console.log("🔷 Domclick Assistant запускается...");

  const bot = createBot(token);

  // Graceful shutdown
  const shutdown = () => {
    console.log("🛑 Останавливаю бота...");
    bot.stop();
    process.exit(0);
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  await bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Бот @${botInfo.username} запущен!`);
      console.log(`🔗 https://t.me/${botInfo.username}`);
    },
  });
}

main().catch((err) => {
  console.error("💥 Критическая ошибка:", err);
  process.exit(1);
});
