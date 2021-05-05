export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DEFAULT_CATEGORIES = [
  {
    categoryName: 'immediate obligations',
    categoryLimitAmount: 0,
    expensesInCategory: [
      { expense: 'rent', amount: 0, limitAmount: 0 },
      { expense: 'electric', amount: 0, limitAmount: 0 },
      { expense: 'water', amount: 0, limitAmount: 0 },
      { expense: 'internet', amount: 0, limitAmount: 0 },
      { expense: 'groceries', amount: 0, limitAmount: 0 },
      { expense: 'gas', amount: 0, limitAmount: 0 },
    ],
  },
  {
    categoryName: 'true expenses',
    categoryLimitAmount: 0,
    expensesInCategory: [
      { expense: 'car maintenance', amount: 0, limitAmount: 0 },
      { expense: 'home maintenance', amount: 0, limitAmount: 0 },
      {
        expense: 'medical insurance',
        amount: 0,
        limitAmount: 0,
      },
      { expense: 'car insurance', amount: 0, limitAmount: 0 },
      { expense: 'home insurance', amount: 0, limitAmount: 0 },
    ],
  },
  {
    categoryName: 'quality of life',
    categoryLimitAmount: 0,
    expensesInCategory: [
      { expense: 'vacation', amount: 0, limitAmount: 0 },
      { expense: 'gym membership', amount: 0, limitAmount: 0 },
      { expense: 'education', amount: 0, limitAmount: 0 },
    ],
  },
  {
    categoryName: 'subscriptions',
    categoryLimitAmount: 0,
    expensesInCategory: [
      { expense: 'netflix', amount: 0, limitAmount: 0 },
      { expense: 'spotify', amount: 0, limitAmount: 0 },
    ],
  },
  {
    categoryName: 'fun',
    categoryLimitAmount: 0,
    expensesInCategory: [
      { expense: 'gaming', amount: 0, limitAmount: 0 },
      { expense: 'music', amount: 0, limitAmount: 0 },
      { expense: 'dining out', amount: 0, limitAmount: 0 },
    ],
  },
];
