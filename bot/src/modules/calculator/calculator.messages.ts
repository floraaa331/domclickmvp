import {
  formatCurrency,
  formatPercent,
  SEPARATOR,
} from "../../utils/formatter";
import type { AnnuityResult, DifferentiatedResult } from "./calculator.service";

const PROPERTY_LABELS: Record<string, string> = {
  new: "Новостройка",
  secondary: "Вторичное жильё",
  house: "Загородный дом",
};

function propertyLabel(type: string): string {
  return PROPERTY_LABELS[type] ?? type;
}

export function welcomeMessage(): string {
  return [
    "🏦 <b>Ипотечный калькулятор</b>",
    "",
    "Рассчитаем ипотеку! Какой тип жилья?",
  ].join("\n");
}

export function askPriceMessage(propertyType: string): string {
  return [
    `🏠 Тип жилья: <b>${propertyLabel(propertyType)}</b>`,
    "",
    "💰 Введите стоимость недвижимости:",
    "",
    "<i>Например: 5 000 000, 5млн, 12.5млн</i>",
  ].join("\n");
}

export function askDownPaymentMessage(price: number): string {
  return [
    `💰 Стоимость: <b>${formatCurrency(price)}</b>`,
    "",
    "💵 Выберите размер первоначального взноса:",
    "",
    `  10% — ${formatCurrency(price * 0.1)}`,
    `  15% — ${formatCurrency(price * 0.15)}`,
    `  20% — ${formatCurrency(price * 0.2)}`,
    `  30% — ${formatCurrency(price * 0.3)}`,
  ].join("\n");
}

export function askTermMessage(): string {
  return [
    "📅 На какой срок берём ипотеку?",
    "",
    "Выберите или введите количество лет:",
  ].join("\n");
}

export function askRateMessage(defaultRate: number, propertyType: string): string {
  return [
    `📊 Средняя ставка для типа «${propertyLabel(propertyType)}»:`,
    "",
    `<b>${formatPercent(defaultRate)}</b>`,
    "",
    "Использовать эту ставку или ввести свою?",
  ].join("\n");
}

export interface ResultParams {
  propertyType: string;
  price: number;
  downPayment: number;
  termYears: number;
  rate: number;
  result: AnnuityResult;
}

export function resultMessage(params: ResultParams): string {
  const { propertyType, price, downPayment, termYears, rate, result } = params;
  const loanAmount = price - downPayment;
  const dpPercent = Math.round((downPayment / price) * 100);
  const overpaymentPercent = Math.round((result.overpayment / loanAmount) * 100);

  return [
    "🏦 <b>РАСЧЁТ ИПОТЕКИ</b>",
    "",
    `🏠 Тип: ${propertyLabel(propertyType)}`,
    `💰 Стоимость: ${formatCurrency(price)}`,
    `💵 Взнос: ${formatCurrency(downPayment)} (${dpPercent}%)`,
    `🏧 Сумма кредита: ${formatCurrency(loanAmount)}`,
    `📅 Срок: ${termYears} лет`,
    `📊 Ставка: ${formatPercent(rate)}`,
    "",
    SEPARATOR,
    "",
    `📌 Ежемесячный платёж: <b>${formatCurrency(result.monthlyPayment)}</b>`,
    `📌 Переплата: ${formatCurrency(result.overpayment)}`,
    `📌 Общая сумма: ${formatCurrency(result.totalPayment)}`,
    "",
    `💡 Переплата составит ${overpaymentPercent}% от суммы кредита`,
    "",
    SEPARATOR,
    "",
    "📊 <b>Разбивка первого платежа:</b>",
    `   Тело долга: ${formatCurrency(result.firstPaymentBreakdown.principal)}`,
    `   Проценты: ${formatCurrency(result.firstPaymentBreakdown.interest)}`,
  ].join("\n");
}

export interface ComparisonParams {
  propertyType: string;
  price: number;
  downPayment: number;
  termYears: number;
  rate: number;
}

export function comparisonMessage(
  annuity: AnnuityResult,
  differentiated: DifferentiatedResult,
  params: ComparisonParams
): string {
  const loanAmount = params.price - params.downPayment;
  const annuitySavings = annuity.overpayment - differentiated.overpayment;

  return [
    "📊 <b>СРАВНЕНИЕ ТИПОВ ПЛАТЕЖЕЙ</b>",
    "",
    `🏧 Сумма кредита: ${formatCurrency(loanAmount)}`,
    `📅 Срок: ${params.termYears} лет · Ставка: ${formatPercent(params.rate)}`,
    "",
    SEPARATOR,
    "",
    "📌 <b>Аннуитетный</b> (равные платежи):",
    `   Платёж: ${formatCurrency(annuity.monthlyPayment)}`,
    `   Переплата: ${formatCurrency(annuity.overpayment)}`,
    `   Итого: ${formatCurrency(annuity.totalPayment)}`,
    "",
    "📌 <b>Дифференцированный</b> (убывающие платежи):",
    `   Первый: ${formatCurrency(differentiated.firstMonthPayment)}`,
    `   Последний: ${formatCurrency(differentiated.lastMonthPayment)}`,
    `   Средний: ${formatCurrency(differentiated.averagePayment)}`,
    `   Переплата: ${formatCurrency(differentiated.overpayment)}`,
    `   Итого: ${formatCurrency(differentiated.totalPayment)}`,
    "",
    SEPARATOR,
    "",
    `💡 Дифференцированный платёж сэкономит <b>${formatCurrency(annuitySavings)}</b> на переплате,`,
    `но первый платёж будет выше на <b>${formatCurrency(differentiated.firstMonthPayment - annuity.monthlyPayment)}</b>`,
  ].join("\n");
}

export function errorParseAmount(): string {
  return "Не удалось распознать сумму \u{1F60A} Попробуй ещё раз, например: 5 000 000 или 5млн";
}

export function errorDownPaymentTooHigh(): string {
  return "❌ Первоначальный взнос не может быть больше или равен стоимости жилья. Попробуйте другую сумму.";
}

export function errorRateInvalid(): string {
  return "❌ Введите ставку от 0.1 до 30, например: 6.5";
}
