import { atom } from 'recoil';
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth();

export const preferencesAtom = atom({
  key: 'preferencesAtom',
  default: {},
});

export const loadingAtom = atom({
  key: 'loadingAtom',
  default: true,
});

export const budgetDataAtom = atom({
  key: 'budgetDataAtom',
  default: {},
});

export const displayedBudgetAtom = atom({
  key: 'displayedBudgetAtom',
  default: {
    year: currentYear,
    month: currentMonth,
  },
});

export const openPopoverAtom = atom({
  key: 'openPopoverAtom',
  default: false,
});

export const userInputValueAtom = atom({
  key: 'userInputValueAtom',
  default: '',
});

export const userAmountValueAtom = atom({
  key: 'userAmountValueAtom',
  default: '',
});

export const popoverErrorAtom = atom({
  key: 'popoverErrorAtom',
  default: '',
});
