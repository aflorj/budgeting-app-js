import React from 'react';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/outline';
import { MONTHS } from '../../constants';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  displayedBudgetAtom,
  budgetDataAtom,
  loadingAtom,
  preferencesAtom,
} from '../../utils/atoms';

// TODO refactor
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth();
//

export default function BudgetInfo() {
  const budgetData = useRecoilValue(budgetDataAtom);
  const setLoading = useSetRecoilState(loadingAtom);
  const [displayedBudget, setDisplayedBudget] = useRecoilState(
    displayedBudgetAtom
  );
  const preferences = useRecoilValue(preferencesAtom);

  function calculateBudget() {
    let totalBudget = 0;
    budgetData.inflows.forEach((element) => (totalBudget += element.amount));
    return totalBudget;
  }

  function calculateAlreadyBudgeted() {
    let alreadyBudgeted = 0;
    budgetData.expenses.forEach((category) =>
      category.expensesInCategory.forEach(
        (expense) => (alreadyBudgeted += expense.amount)
      )
    );
    return alreadyBudgeted;
  }

  function calculateToBeBudgeted() {
    let tbb = 0 + calculateBudget();
    return tbb - calculateAlreadyBudgeted();
  }

  function changeMonth(direction) {
    // loading component while the new doc is being fetched
    setLoading(true);

    // next month
    if (direction === 'next') {
      // December
      if (displayedBudget.month === 11) {
        setDisplayedBudget({
          year: displayedBudget.year + 1,
          month: 0,
        });
      } else {
        // any other month
        setDisplayedBudget({
          year: displayedBudget.year,
          month: displayedBudget.month + 1,
        });
      }
    }

    // previous month
    if (direction === 'previous') {
      // Januar
      if (displayedBudget.month === 0) {
        setDisplayedBudget({
          year: displayedBudget.year - 1,
          month: 11,
        });
      } else {
        // any other month
        setDisplayedBudget({
          year: displayedBudget.year,
          month: displayedBudget.month - 1,
        });
      }
    }
  }

  // TODO check for previous budgets from the user
  // TEMPORARY condition for displaying the 'previous month' arrow
  function conditionPrevious() {
    if (displayedBudget.year > currentYear) {
      return true;
    } else if (displayedBudget.month >= currentMonth) {
      return true;
    } else {
      return false;
    }
  }

  // only display the 'next month' arrow for one month ahead
  function conditionNext() {
    if (displayedBudget.year < currentYear) {
      return true;
    } else if (displayedBudget.month <= currentMonth) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <div className="bg-green-100 flex flex-row items-center rounded-lg shadow-lg m-2">
      <div className="ml-20 flex items-center">
        {conditionPrevious() && (
          <ChevronLeftIcon
            className="h-8 w-8 cursor-pointer transform transition hover:scale-125 opacity-50 hover:opacity-100"
            onClick={() => changeMonth('previous')}
          />
        )}
        <div className="flex-col">
          <div>Your budget for</div>
          <div className="flex justify-center">
            <p className="font-bold text-xl">
              {MONTHS[displayedBudget.month]} {displayedBudget.year}
            </p>
          </div>
        </div>
        {conditionNext() && (
          <ChevronRightIcon
            className="h-8 w-8 cursor-pointer transform transition hover:scale-125 opacity-50 hover:opacity-100"
            onClick={() => changeMonth('next')}
          />
        )}
      </div>
      <div className="font-extrabold text-white p-5 ml-40 bg-green-400 rounded-md">
        {calculateToBeBudgeted().toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{' '}
        {preferences.currency}
        <br />
        <p className="font-normal">to be budgeted</p>
      </div>
      <div className="flex flex-col text-sm ml-2">
        <p>
          +
          {calculateBudget().toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          {preferences.currency} Funds for {MONTHS[displayedBudget.month]}
        </p>
        <p>
          -0.00€ Overspent in{' '}
          {MONTHS[displayedBudget.month === 0 ? 11 : displayedBudget.month - 1]}
        </p>
        <p>
          -
          {calculateAlreadyBudgeted().toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          {preferences.currency} Budgeted in {MONTHS[displayedBudget.month]}
        </p>
        <p>-0.00€ Budgeted in Future</p>
      </div>
    </div>
  );
}
