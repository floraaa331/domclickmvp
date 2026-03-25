import ThemeToggle from "@/components/ThemeToggle";

interface Feature {
  emoji: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    emoji: "🧮",
    title: "Ипотечный калькулятор",
    description:
      "Мгновенный расчёт ипотеки с учётом ставки, срока и первоначального взноса. Поддержка семейной и IT-ипотеки.",
  },
  {
    emoji: "🏘️",
    title: "Гид по районам",
    description:
      "Подробная информация о районах Москвы: инфраструктура, транспорт, экология, цены и рейтинги.",
  },
  {
    emoji: "📝",
    title: "Генератор объявлений",
    description:
      "AI создаёт привлекательные тексты объявлений о продаже квартир на основе характеристик объекта.",
  },
  {
    emoji: "✅",
    title: "Чек-лист покупателя",
    description:
      "Интерактивный чек-лист всех этапов покупки квартиры — от поиска до получения ключей.",
  },
];

interface Step {
  number: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Откройте бота",
    description:
      "Найдите @domclick_assistant_bot в Telegram или перейдите по ссылке.",
  },
  {
    number: "02",
    title: "Выберите функцию",
    description:
      "Используйте удобное меню для выбора: калькулятор, районы, объявления или чек-лист.",
  },
  {
    number: "03",
    title: "Получите результат",
    description:
      "Бот мгновенно обработает запрос и выдаст полезную информацию.",
  },
];

interface TechBadge {
  name: string;
  color: string;
}

const techStack: TechBadge[] = [
  { name: "TypeScript", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  { name: "Node.js", color: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" },
  { name: "grammY", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300" },
  { name: "Next.js", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  { name: "Prisma", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  { name: "SQLite", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                Domclick Assistant
              </span>
            </a>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Dashboard
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-[0.06] dark:opacity-[0.12]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/10 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8">
            <span>🤖</span>
            <span>Telegram Bot</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Domclick{" "}
            <span className="gradient-text">Assistant</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            AI-помощник по недвижимости в Telegram. Рассчитает ипотеку, расскажет
            о районах Москвы, сгенерирует объявление и проведёт через все этапы
            покупки квартиры.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://t.me/domclick_assistant_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-bg text-white font-semibold text-base shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              Открыть бота в Telegram
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-base hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Admin Panel
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Возможности
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Всё, что нужно для принятия решения о покупке квартиры
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card group hover:border-primary-200 dark:hover:border-primary-800"
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 sm:py-28 bg-gray-100/50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Как это работает
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
              Три простых шага
            </p>
          </div>
          <div className="space-y-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-6 card"
              >
                <div className="shrink-0 w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {step.number}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built with AI */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
            <span>🧠</span>
            <span>AI-Powered Development</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Создано с помощью AI
          </h2>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
            Этот проект — бот, веб-панель и вся инфраструктура — был разработан
            с активным использованием AI-инструментов примерно за 2 дня.
            Демонстрация того, как современные AI-технологии ускоряют разработку.
          </p>

          {/* Tech stack */}
          <div className="mt-10">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Технологии
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {techStack.map((tech) => (
                <span
                  key={tech.name}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${tech.color}`}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl gradient-bg p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-60" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Попробуйте прямо сейчас
              </h2>
              <p className="mt-4 text-lg text-white/80 max-w-lg mx-auto">
                Откройте бота в Telegram и рассчитайте ипотеку за 30 секунд
              </p>
              <a
                href="https://t.me/domclick_assistant_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 px-8 py-4 rounded-xl bg-white text-primary-700 font-bold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Открыть @domclick_assistant_bot
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Made with ❤️ for Domclick
          </p>
        </div>
      </footer>
    </div>
  );
}
