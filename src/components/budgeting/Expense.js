import React from 'react';
import { Line } from 'rc-progress';
import ExpenseLimit from './ExpenseLimit';
import { cloneDeep } from 'lodash';
import { Popover, ArrowContainer } from 'react-tiny-popover';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  budgetDataAtom,
  openPopoverAtom,
  userInputValueAtom,
  popoverErrorAtom,
  userAmountValueAtom,
  preferencesAtom,
} from '../../utils/atoms';
import { Trans, useTranslation } from 'react-i18next';

export default function Expense({
  expenseObject,
  categoryName,
  inputElement,
  helpers,
}) {
  const { t } = useTranslation();
  const userInputValue = useRecoilValue(userInputValueAtom);
  const [budgetData, setBudgetData] = useRecoilState(budgetDataAtom);
  const [popoverError, setPopoverError] = useRecoilState(popoverErrorAtom);
  const [openPopover, setOpenPopover] = useRecoilState(openPopoverAtom);
  const userAmountValue = useRecoilValue(userAmountValueAtom);
  const preferences = useRecoilValue(preferencesAtom);

  // renaming an expense
  function handleExpenseEditSubmit(e, category, expense) {
    e.preventDefault();
    const userInput = userInputValue.trim();

    // array of all expenses in the user's budget so we can compare for duplicates
    const allExpenses = [];
    budgetData.expenses.forEach((category) =>
      category.expensesInCategory.forEach((expense) =>
        allExpenses.push(expense.expense)
      )
    );
    const expenseDuplicates = allExpenses.find(
      (expense) => expense.toLowerCase() === userInput.toLowerCase()
    );

    // first check if there were any changes to the expense name
    if (expense === userInput) {
      // no changes, close the popover
      helpers.resetPopover();
    } else {
      // changes were made, check if the new name is valid
      if (userInputValue.length > 0) {
        if (userInput.length > 0) {
          // valid input but still need to check for duplicates
          if (expenseDuplicates) {
            // the new expense name is not uniue, throw an error and leave the popover open
            setPopoverError('Expense already exists!');
          } else {
            // the new expense name is unique
            // change the expense name and close the popover

            // the index of the category that the edited expense belongs to
            const indexOfCategory = budgetData.expenses.findIndex(
              (element) => element.categoryName === category
            );

            // the index of the expense inside the category at that index
            const indexOfExpense = budgetData.expenses[
              indexOfCategory
            ].expensesInCategory.findIndex(
              (element) => element.expense === expense
            );

            // apply the changes to the atom
            // copy of the array of the expenses in the category the edited expense belongs to
            let expensesArrayCopy = cloneDeep(budgetData.expenses);
            expensesArrayCopy[indexOfCategory].expensesInCategory[
              indexOfExpense
            ].expense = userInput;
            setBudgetData((budgetData) => ({
              ...budgetData,
              expenses: expensesArrayCopy,
            }));
            // reset the expense popover
            helpers.resetPopover();
          }
        } else {
          // invalid input, throw an error and leave the popover open
          setPopoverError('Invalid expense name!');
        }
      } else {
        // user cleared the input - cancel the edit
        helpers.resetPopover();
      }
    }
  }

  // removing an expense
  function deleteExpense(e, category, expense) {
    e.preventDefault();

    // the index of the category that the deleted expense belongs to
    const indexOfCategory = budgetData.expenses.findIndex(
      (element) => element.categoryName === category
    );

    // the index of the expense inside the category at that index
    const indexOfExpense = budgetData.expenses[
      indexOfCategory
    ].expensesInCategory.findIndex((element) => element.expense === expense);

    // apply the changes to the atom
    // copy of the array of the expenses in the category the deleted expense belongs to
    let expensesArrayCopy = cloneDeep(budgetData.expenses);
    expensesArrayCopy[indexOfCategory].expensesInCategory.splice(
      indexOfExpense,
      1
    );
    setBudgetData((budgetData) => ({
      ...budgetData,
      expenses: expensesArrayCopy,
    }));
    helpers.resetPopover();
  }

  // changing the amount of an expense
  function handleAmountSubmit(e, category, expenseObject) {
    e.preventDefault();

    // the index of the category that the edited expense belongs to
    const indexOfCategory = budgetData.expenses.findIndex(
      (element) => element.categoryName === category
    );

    // the index of the expense inside the category at that index
    const indexOfExpense = budgetData.expenses[
      indexOfCategory
    ].expensesInCategory.findIndex(
      (element) => element.expense === expenseObject.expense
    );

    // clearing the input and submitting equals to setting the expense amount to zero
    if (userAmountValue.length === 0) {
      let expensesArrayCopy = cloneDeep(budgetData.expenses);
      expensesArrayCopy[indexOfCategory].expensesInCategory[
        indexOfExpense
      ].amount = 0;

      // set it to zero in the atom
      setBudgetData((budgetData) => ({
        ...budgetData,
        expenses: expensesArrayCopy,
      }));
    } else {
      // the user has changed the amount of this expense and did not leave the input field empty
      // and the value of the input was a number
      if (
        expenseObject.amount !== parseFloat(userAmountValue) &&
        !isNaN(userAmountValue) &&
        parseFloat(userAmountValue) >= 0
      ) {
        // apply the changes to the atom
        // copy of the array of the expenses in the category the edited expense belongs to
        let expensesArrayCopy = cloneDeep(budgetData.expenses);
        expensesArrayCopy[indexOfCategory].expensesInCategory[
          indexOfExpense
        ].amount = parseFloat(userAmountValue);

        setBudgetData((budgetData) => ({
          ...budgetData,
          expenses: expensesArrayCopy,
        }));
      }
    }

    setOpenPopover(false);
  }

  return (
    <div
      // border before hover is the same color as background
      className="border-b-2 border-gray-100 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400 pl-2 flex justify-between"
      id="expense-line"
      key={expenseObject.expense}
    >
      {/* ta objame expense in prvi input */}
      <div className="flex justify-between w-4/5">
        <div className="flex justify-between w-7/12">
          <div className="cursor-pointer">
            {/* editing an expense - start */}
            <Popover
              isOpen={openPopover === 'expense_' + expenseObject.expense}
              positions={['bottom', 'top']}
              onClickOutside={() => helpers.resetPopover()}
              content={({ position, childRect, popoverRect }) => (
                <ArrowContainer
                  position={position}
                  childRect={childRect}
                  popoverRect={popoverRect}
                  arrowColor={'white'}
                  arrowSize={10}
                  arrowStyle={{ opacity: 0.7 }}
                >
                  <div className="rounded-md bg-white p-2">
                    <form
                      onSubmit={(e) =>
                        handleExpenseEditSubmit(
                          e,
                          categoryName,
                          expenseObject.expense
                        )
                      }
                    >
                      <input
                        className="border-2 border-blue-400 focus:border-blue-300 rounded-sm py-1 px-2 focus:ring-10"
                        spellCheck="false"
                        autoComplete="off"
                        maxLength="64"
                        type="text"
                        placeholder={t('New name for this expense')}
                        value={userInputValue}
                        ref={inputElement}
                        onChange={(e) => helpers.handleInputChange(e)}
                      />
                      {popoverError && (
                        <div className="text-sm text-red-500">
                          <Trans>{popoverError}</Trans>
                        </div>
                      )}
                      <div className="pt-2 flex justify-between">
                        <button
                          type="button"
                          onClick={(e) =>
                            deleteExpense(
                              e,
                              categoryName,
                              expenseObject.expense
                            )
                          }
                          className="text-red-500 hover:bg-red-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                        >
                          <Trans>Delete</Trans>
                        </button>
                        <div className="flex">
                          <button
                            type="button"
                            onClick={() => helpers.resetPopover()}
                            className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                          >
                            <Trans>Cancel</Trans>
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                          >
                            <Trans>OK</Trans>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </ArrowContainer>
              )}
            >
              <div
                className="pl-2 flex hover:text-gray-600 dark:hover:text-gray-400"
                id="expense-name"
                onClick={() =>
                  openPopover === 'expense_' + expenseObject.expense
                    ? helpers.resetPopover()
                    : helpers.prepareEdit('expense_', expenseObject.expense)
                }
              >
                {expenseObject.expense}
              </div>
            </Popover>
            {/* editing an expense - end */}
          </div>
          <div className="w-1/3 text-sm">
            {expenseObject.limitAmount > 0 &&
              expenseObject.amount > 0 &&
              expenseObject.amount <= expenseObject.limitAmount && (
                <div className="items-center flex space-x-2">
                  <Line
                    percent={helpers.calculatePercentage(
                      expenseObject.amount,
                      expenseObject.limitAmount
                    )}
                    strokeWidth="10"
                    trailWidth="10"
                    strokeColor={
                      helpers.calculatePercentage(
                        expenseObject.amount,
                        expenseObject.limitAmount
                      ) < 70
                        ? '#34d399'
                        : helpers.calculatePercentage(
                            expenseObject.amount,
                            expenseObject.limitAmount
                          ) < 90
                        ? '#FFA500'
                        : '#FF0000'
                    }
                  />
                  <div>
                    {helpers.calculatePercentage(
                      expenseObject.amount,
                      expenseObject.limitAmount
                    ) + '%'}
                  </div>
                </div>
              )}
            {expenseObject.limitAmount > 0 &&
              expenseObject.amount > 0 &&
              expenseObject.amount > expenseObject.limitAmount && (
                <div className="text-red-500 text-base font-bold">
                  {'-'}
                  {(
                    expenseObject.amount - expenseObject.limitAmount
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {preferences.displaySymbol && preferences.currency}
                </div>
              )}
          </div>
        </div>
        <div className="flex">
          <form
            onSubmit={(e) => handleAmountSubmit(e, categoryName, expenseObject)}
          >
            <input
              className="text-right bg-gray-100 dark:bg-gray-600 cursor-pointer focus:bg-white hover:text-gray-600 dark:hover:text-gray-400"
              id="amount"
              size="10"
              key={expenseObject.expense}
              type="text"
              onClick={() =>
                helpers.prepareAmountEdit(
                  'expenseAmount',
                  expenseObject.expense,
                  expenseObject.amount
                )
              }
              onChange={(e) => helpers.handleAmountChange(e)}
              onBlur={(e) => handleAmountSubmit(e, categoryName, expenseObject)}
              spellCheck="false"
              autoComplete="off"
              value={
                openPopover === 'expenseAmount_' + expenseObject.expense
                  ? userAmountValue
                  : expenseObject.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
              }
            />
          </form>
          {preferences.displaySymbol && preferences.currency}
        </div>
        {/* do tu objamemo prvi input */}
      </div>
      {/* do tu objamemo prvi input */}
      <ExpenseLimit
        expenseObject={expenseObject}
        categoryName={categoryName}
        helpers={helpers}
      />
    </div>
  );
}
