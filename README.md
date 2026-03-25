```
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🏠  DOMCLICK ASSISTANT                         ║
║   AI-помощник по недвижимости в Telegram          ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![grammY](https://img.shields.io/badge/grammY-1.21-blue?logo=telegram)](https://grammy.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-indigo?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## О проекте

**Domclick Assistant** — полнофункциональный Telegram-бот и веб-панель для помощи в вопросах недвижимости. Проект демонстрирует современный стек разработки, продуманный UX и внимание к деталям.

> 🎯 Создан как портфолио-проект для позиции вайб-кодера в Domclick

## ✨ Возможности

### 🏦 Ипотечный калькулятор
- Пошаговый расчёт через inline-кнопки
- Умный парсинг ввода (5млн, 5 000 000, 5kk)
- Сравнение аннуитетных и дифференцированных платежей
- Генерация графика платежей в Excel

### 🗺 Подбор района
- Multi-select критериев (метро, экология, школы...)
- База из 20 районов Москвы с реальными данными
- Визуальное сравнение районов с рейтинговыми шкалами
- Карточки районов с подробной информацией

### 📝 Генератор объявлений
- Два стиля: лаконичный и продающий
- Пошаговый сбор параметров с валидацией
- Выбор особенностей через multi-select
- Копирование результата одной кнопкой

### ✅ Чек-лист покупки
- 10 шагов с прогресс-баром
- Сохранение прогресса в базу данных
- Полезные советы и документы на каждом шаге
- Возможность продолжить с места остановки

### 💎 Дополнительно
- Персонализация — бот обращается по имени
- Советы дня при каждом входе
- Статистика пользователя
- Красивая веб-админка с дашбордом
- Лендинг-страница с описанием бота

## 🚀 Быстрый старт

```bash
# 1. Клонируй и настрой
git clone https://github.com/your-username/domclick-assistant.git
cd domclick-assistant
cp .env.example .env  # Добавь BOT_TOKEN от @BotFather

# 2. Запусти бота
cd bot && npm install && npx prisma db push --schema=src/db/schema.prisma && npm run dev

# 3. Запусти веб-панель (в отдельном терминале)
cd web && npm install && npm run dev
```

Или через Docker:
```bash
docker-compose up --build
```

## 🏗 Архитектура

```
domclick-assistant/
├── bot/                    # Telegram-бот (grammY + TypeScript)
│   ├── src/
│   │   ├── modules/        # Модули: calculator, districts, ad-generator, checklist
│   │   │   └── */          # handler.ts + service.ts + messages.ts
│   │   ├── middleware/      # auth, logger, error-handler
│   │   ├── utils/           # formatter, parser, keyboard
│   │   ├── data/            # Статические данные (районы, советы)
│   │   └── db/              # Prisma schema + клиент
│   └── package.json
├── web/                    # Веб-панель (Next.js 14 + Tailwind)
│   ├── app/                # App Router
│   │   ├── page.tsx        # Dashboard
│   │   └── demo/page.tsx   # Landing page
│   └── components/         # React компоненты
├── docker-compose.yml
└── .env.example
```

**Принципы:**
- Каждый модуль бота изолирован: `handler` (grammY) → `service` (логика) → `messages` (тексты)
- Все тексты сообщений вынесены в отдельные файлы — легко локализовать
- Строгий TypeScript без `any`
- Error boundary — бот никогда не падает

## ⚡ Built with AI

Этот проект создан с использованием AI-инструментов как демонстрация подхода «вайб-кодинг»:

- **Claude Code** — основной инструмент разработки
- **Время разработки** — ~2 дня
- **Строк кода** — 3000+
- **Модулей** — 4 полноценных модуля бота + веб-панель

AI использовался для генерации архитектуры, написания кода, создания текстов сообщений и данных по районам. Человек определял требования, UX-решения и финальное качество.

## 🛠 Стек технологий

| Компонент | Технология |
|-----------|-----------|
| Бот | Node.js, TypeScript, grammY |
| База данных | SQLite, Prisma ORM |
| Веб-панель | Next.js 14, React, Tailwind CSS |
| Графики | Recharts |
| Контейнеризация | Docker, docker-compose |

## 📄 Лицензия

MIT — используйте свободно.

---

<p align="center">
  Made with ❤️ for <b>Domclick</b>
</p>
