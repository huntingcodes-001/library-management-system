import { format, addDays, differenceInDays, isAfter } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

export function calculateDueDate(issueDate: string, days: number = 14): string {
  return addDays(new Date(issueDate), days).toISOString();
}

export function getDaysOverdue(dueDate: string): number {
  const today = new Date();
  const due = new Date(dueDate);
  return isAfter(today, due) ? differenceInDays(today, due) : 0;
}

export function isOverdue(dueDate: string): boolean {
  return isAfter(new Date(), new Date(dueDate));
}