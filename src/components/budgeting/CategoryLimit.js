import React from 'react';
import { cloneDeep } from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  budgetDataAtom,
  openPopoverAtom,
  userAmountValueAtom,
  preferencesAtom,
} from '../../utils/atoms';

export default function CategoryLimit({ category }) {
  const [budgetData, setBudgetData] = useRecoilState(budgetDataAtom);
  const [openPopover, setOpenPopover] = useRecoilState(openPopoverAtom);
  const [userAmountValue, setUserAmountValue] = useRecoilState(
    userAmountValueAtom
  );
  const preferences = useRecoilValue(preferencesAtom);

  // COMMON
  // sets the name and the value of the expense, inflow, expense limit or category limit that is being edited
  function prepareAmountEdit(type, element, amount) {
    setOpenPopover(type + '_' + element);
    if (amount === 0) {
      // this fix can be removed when/if input value is highlighted on click
      setUserAmountValue('');
    } else {
      setUserAmountValue(amount);
    }
  }

  // handing the change in user input when the input is a number
  function handleAmountChange(e) {
    setUserAmountValue(e.target.value);
  }
  // COMMON

  // changing the amount of a category limit
  function handleCategoryLimitSubmit(e, category) {
    e.preventDefault();

    // the index of the category that the edited limit belongs to
    const indexOfCategory = budgetData.expenses.findIndex(
      (element) => element.categoryName === category.categoryName
    );

    // clearing the input and submitting equals to setting the limit for that category to zero
    if (userAmountValue.length === 0) {
      let expensesArrayCopy = cloneDeep(budgetData.expenses);
      expensesArrayCopy[indexOfCategory].categoryLimitAmount = 0;

      // remove the category limit in the local state
      setBudgetData((budgetData) => ({
        ...budgetData,
        expenses: expensesArrayCopy,
      }));
    } else {
      // the user has changed the amount of this category limit and did not leave the input field empty
      // and the value of the input was a number
      if (
        category.categoryLimitAmount !== parseFloat(userAmountValue) &&
        !isNaN(userAmountValue)
      ) {
        // apply the changes to the local state
        // copy of the array of the expenses in the category the edited category belongs to
        let expensesArrayCopy = cloneDeep(budgetData.expenses);
        expensesArrayCopy[indexOfCategory].categoryLimitAmount = parseFloat(
          userAmountValue
        );
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
      <form onSubmit={(e) => handleCategoryLimitSubmit(e, category)}>
        <input
          className="text-right bg-green-100 cursor-pointer focus:bg-white hover:text-gray-600"
          id="category-limit-amount"
          size="10"
          key={'categoryLimit_' + category.categoryName}
          type="text"
          onClick={() =>
            prepareAmountEdit(
              'categoryLimitAmount',
              category.categoryName,
              category.categoryLimitAmount
            )
          }
          onChange={(e) => handleAmountChange(e)}
          onBlur={(e) => handleCategoryLimitSubmit(e, category)}
          spellCheck="false"
          autoComplete="off"
          value={
            openPopover === 'categoryLimitAmount_' + category.categoryName
              ? userAmountValue
              : category.categoryLimitAmount > 0
              ? category.categoryLimitAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : 'Set limit'
          }
        />
      </form>
      {category.categoryLimitAmount > 0 && preferences.currency}
    </div>
  );
}
