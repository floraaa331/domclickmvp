import ActivityChart from "@/components/ActivityChart";
import ThemeToggle from "@/components/ThemeToggle";

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  bgColor: string;
}

const stats: StatCard[] = [
  {
    label: "Всего пользователей",
    value: "1,247",
    icon: "👥",
    color: "text-primary-600 dark:text-primary-400",
    bgColor: "bg-primary-50 dark:bg-primary-900/30",
  },
  {
    label: "Расчётов сегодня",
    value: "89",
    icon: "📊",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
  },
  {
    label: "Средняя стоимость",
    value: "12.4 млн ₽",
    icon: "💰",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-900/30",
  },
  {
    label: "Популярный район",
    value: "Раменки",
    icon: "📍",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-900/30",
  },
];

interface RecentAction {
  time: string;
  user: string;
  action: string;
}

const recentActions: RecentAction[] = [
  {
    time: "14:32",
    user: "Алексей М.",
    action: "Расчёт ипотеки — 15 млн ₽, 20 лет",
  },
  {
    time: "14:28",
    user: "Мария К.",
    action: "Просмотр района Хамовники",
  },
  {
    time: "14:15",
    user: "Дмитрий В.",
    action: "Генерация объявления — 2-к кв. 65 м²",
  },
  {
    time: "13:58",
    user: "Елена С.",
    action: "Чек-лист покупки квартиры",
  },
  {
    time: "13:45",
    user: "Иван П.",
    action: "Расчёт ипотеки — 8 млн ₽, 15 лет",
  },
  {
    time: "13:30",
    user: "Ольга Н.",
    action: "Сравнение районов: Раменки vs Фили",
  },
  {
    time: "13:12",
    user: "Сергей Т.",
    action: "Расчёт ипотеки — 22 млн ₽, 25 лет",
  },
  {
    time: "12:55",
    user: "Анна Р.",
    action: "Просмотр района Тверской",
  },
  {
    time: "12:40",
    user: "Павел Г.",
    action: "Генерация объявления — 1-к кв. 38 м²",
  },
  {
    time: "12:22",
    user: "Наталья Л.",
    action: "Расчёт ипотеки — 10 млн ₽, 30 лет",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  Domclick Assistant
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                  Admin Panel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/demo"
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Demo
              </a>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Обзор активности бота за последние 24 часа
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`stat-icon ${stat.bgColor}`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Table row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Activity chart */}
          <div className="lg:col-span-3 card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Активность
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Пользователи и расчёты за неделю
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                  <span className="text-gray-500 dark:text-gray-400">
                    Пользователи
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-300" />
                  <span className="text-gray-500 dark:text-gray-400">
                    Расчёты
                  </span>
                </div>
              </div>
            </div>
            <ActivityChart />
          </div>

          {/* Recent actions */}
          <div className="lg:col-span-2 card overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Последние действия
            </h3>
            <div className="space-y-0 -mx-6">
              {recentActions.map((action, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5 shrink-0 w-10">
                    {action.time}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {action.user}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {action.action}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
