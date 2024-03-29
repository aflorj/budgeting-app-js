import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { ChartPieIcon } from '@heroicons/react/outline';
import { Trans } from 'react-i18next';
import { PIE_CHART_COLORS } from '../../utils/constants';

export default function Charts({ expenses }) {
  // chart 1: 'by expense'
  const [pieDataExpenses, setPieDataExpenses] = useState({});
  const [drawPieExpenses, setDrawPieExpenses] = useState(false);

  // chart 2: 'by category'
  const [pieDataCategories, setPieDataCategories] = useState({});
  const [drawPieCategories, setDrawPieCategories] = useState(false);

  // a function that rebuilds the data objects on every expense change by the user
  function pieBuilder(expensesObject) {
    // BY EXPENSE
    let expensesToDisplay = [];
    let amountsToDisplay = [];

    // only display an expense on the pie chart if its amount is higher than 0
    expensesObject.forEach((category) => {
      category.expensesInCategory.forEach((expenseInCategory) => {
        if (expenseInCategory.amount > 0) {
          expensesToDisplay.push(expenseInCategory.expense);
          amountsToDisplay.push(expenseInCategory.amount);
        }
      });
    });

    setPieDataExpenses({
      labels: expensesToDisplay,
      datasets: [
        {
          data: amountsToDisplay,
          backgroundColor: PIE_CHART_COLORS,
        },
      ],
    });

    // only display the expenses piechart if there's at least two expenses to be displayed
    if (expensesToDisplay.length > 1) {
      setDrawPieExpenses(true);
    } else {
      setDrawPieExpenses(false);
    }

    // BY CATEGORY
    let categoriesToDisplay = [];
    let categoryAmountsToDisplay = [];

    // only display a category if it has any set expenses inside
    expensesObject.forEach((category) => {
      let totalInCategory = 0;
      category.expensesInCategory.forEach((expenseInCategory) => {
        if (expenseInCategory.amount > 0) {
          totalInCategory += expenseInCategory.amount;
        }
      });
      if (totalInCategory > 0) {
        categoriesToDisplay.push(category.categoryName);
        categoryAmountsToDisplay.push(totalInCategory);
      }
    });

    setPieDataCategories({
      labels: categoriesToDisplay,
      datasets: [
        {
          data: categoryAmountsToDisplay,
          backgroundColor: PIE_CHART_COLORS,
        },
      ],
    });

    // only display the categories piechart if there's at least two categories to be displayed
    if (categoriesToDisplay.length > 1) {
      setDrawPieCategories(true);
    } else {
      setDrawPieCategories(false);
    }
  }

  // rebuid charts on every expense change
  useEffect(() => {
    pieBuilder(expenses);
  }, [expenses]);

  return (
    <div id="charts-wrapper" className="flex flex-col md:flex-row lg:flex-col">
      <div className="w-auto md:w-1/2 lg:w-full">
        {drawPieExpenses ? (
          <div className="grid justify-items-center pt-8">
            <div className="mb-2">
              <Trans>By expense</Trans>
            </div>
            <Pie data={pieDataExpenses} legend={{ position: 'bottom' }} />
          </div>
        ) : (
          <div className="flex justify-center items-end pt-8">
            <ChartPieIcon className="w-6 h-6" />
            <p className="italic text-gray-600 dark:text-gray-200">
              <Trans>You must enter at least two expenses to display the</Trans>
              <span className="text-black dark:text-gray-400">
                <Trans> Expenses chart</Trans>
              </span>
              .
            </p>
          </div>
        )}
      </div>
      <div className="w-auto md:w-1/2 lg:w-full">
        {drawPieCategories ? (
          <div className="grid justify-items-center pt-8 max-w-screen">
            <div className="mb-2">
              <Trans>By category</Trans>
            </div>
            <Pie data={pieDataCategories} legend={{ position: 'bottom' }} />
          </div>
        ) : (
          <div className="flex justify-center items-end pt-8">
            <ChartPieIcon className="w-6 h-6" />
            <p className="italic text-gray-600 dark:text-gray-200">
              <Trans>
                You must enter expenses in at least two categories to display
                the
              </Trans>
              <span className="text-black dark:text-gray-400">
                <Trans> Categories chart</Trans>
              </span>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
