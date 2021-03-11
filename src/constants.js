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
    expensesInCategory: [
      { expense: 'rent', amount: 0 },
      { expense: 'electric', amount: 0 },
      { expense: 'water', amount: 0 },
      { expense: 'internet', amount: 0 },
      { expense: 'groceries', amount: 0 },
      { expense: 'gas', amount: 0 },
    ],
  },
  {
    categoryName: 'true expenses',
    expensesInCategory: [
      { expense: 'car maintenance', amount: 0 },
      { expense: 'home maintenance', amount: 0 },
      { expense: 'medical insurance', amount: 0 },
      { expense: 'car insurance', amount: 0 },
      { expense: 'home insurance', amount: 0 },
    ],
  },
  {
    categoryName: 'quality of life',
    expensesInCategory: [
      { expense: 'vacation', amount: 0 },
      { expense: 'gym membership', amount: 0 },
      { expense: 'education', amount: 0 },
    ],
  },
  {
    categoryName: 'subscriptions',
    expensesInCategory: [
      { expense: 'netflix', amount: 0 },
      { expense: 'spotify', amount: 0 },
    ],
  },
  {
    categoryName: 'fun',
    expensesInCategory: [
      { expense: 'gaming', amount: 0 },
      { expense: 'music', amount: 0 },
      { expense: 'dining out', amount: 0 },
    ],
  },
];
