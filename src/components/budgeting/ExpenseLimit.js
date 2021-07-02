import React from 'react';
import { cloneDeep } from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  budgetDataAtom,
  openPopoverAtom,
  userAmountValueAtom,
  preferencesAtom,
} from '../../utils/atoms';
import { useTranslation } from 'react-i18next';

export default function ExpenseLimit({ expenseObject, categoryName, helpers }) {
  const { t } = useTranslation();
  const [budgetData, setBudgetData] = useRecoilState(budgetDataAtom);
  const [openPopover, setOpenPopover] = useRecoilState(openPopoverAtom);
  const userAmountValue = useRecoilValue(userAmountValueAtom);
  const preferences = useRecoilValue(preferencesAtom);

  // changing the amount of an expense limit
  function handleExpenseLimitSubmit(e, category, expenseObject) {
    e.preventDefault();

    // the index of the category that the edited expense limit belongs to
    const indexOfCategory = budgetData.expenses.findIndex(
      (element) => element.categoryName === category
    );

    // the index of the expense inside the category at that index
    const indexOfExpense = budgetData.expenses[
      indexOfCategory
    ].expensesInCategory.findIndex(
      (element) => element.expense === expenseObject.expense
    );

    // clearing the input and submitting equals to setting the limit for that expense to zero
    if (userAmountValue.length === 0) {
      let expensesArrayCopy = cloneDeep(budgetData.expenses);
      expensesArrayCopy[indexOfCategory].expensesInCategory[
        indexOfExpense
      ].limitAmount = 0;

      // remove the expense limit in the atom
      setBudgetData((budgetData) => ({
        ...budgetData,
        expenses: expensesArrayCopy,
      }));
    } else {
      // the user has changed the amount of this expense limit and did not leave the input field empty
      // and the value of the input was a number
      if (
        expenseObject.limitAmount !== parseFloat(userAmountValue) &&
        !isNaN(userAmountValue) &&
        parseFloat(userAmountValue) >= 0
      ) {
        // apply the changes to the atom
        // copy of the array of the expenses in the category the edited expense belongs to
        let expensesArrayCopy = cloneDeep(budgetData.expenses);
        expensesArrayCopy[indexOfCategory].expensesInCategory[
          indexOfExpense
        ].limitAmount = parseFloat(userAmountValue);
        setBudgetData((budgetData) => ({
          ...budgetData,
          expenses: expensesArrayCopy,
        }));
      }
    }

    setOpenPopover(false);
  }

  return (
    <div className="px-1 flex">
      <form
        onSubmit={(e) =>
          handleExpenseLimitSubmit(e, categoryName, expenseObject)
        }
      >
        <input
          className="text-right bg-gray-100 dark:bg-gray-600 cursor-pointer focus:bg-white hover:text-gray-600 dark:hover:text-gray-400"
          id="limit-amount"
          size="10"
          key={expenseObject.expense}
          type="text"
          onClick={() =>
            helpers.prepareAmountEdit(
              'expenseLimitAmount',
              expenseObject.expense,
              expenseObject.limitAmount
            )
          }
          onChange={(e) => helpers.handleAmountChange(e)}
          onBlur={(e) =>
            handleExpenseLimitSubmit(e, categoryName, expenseObject)
          }
          spellCheck="false"
          autoComplete="off"
          value={
            openPopover === 'expenseLimitAmount_' + expenseObject.expense
              ? userAmountValue
              : expenseObject.limitAmount > 0
              ? expenseObject.limitAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : t('Set limit')
          }
        />
      </form>
      {expenseObject.limitAmount > 0 &&
        preferences.displaySymbol &&
        preferences.currency}
    </div>
  );
}
