import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { ChartPieIcon } from '@heroicons/react/outline';

// TODO pie chart colors

export default function Charts({ expenses }) {
  const [pieData, setPieData] = useState({});
  const [drawPie, setDrawPie] = useState(false);

  // a function that rebuilds the data object on every expense change by the user
  function pieBuilder(expensesObject) {
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

    setPieData({
      labels: expensesToDisplay,
      datasets: [
        {
          data: amountsToDisplay,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        },
      ],
    });

    // only display the piechart if there's at least two expenses to be displayed
    if (expensesToDisplay.length > 1) {
      setDrawPie(true);
    } else {
      setDrawPie(false);
    }
  }

  useEffect(() => {
    pieBuilder(expenses);
  }, [expenses]);

  return drawPie ? (
    <div className="flex justify-center pt-8">
      <Pie data={pieData} legend={{ position: 'bottom' }} />
    </div>
  ) : (
    <div className="flex justify-center items-end pt-8">
      <ChartPieIcon className="w-6 h-6" />
      <p className="italic text-gray-700">
        You must enter at least two expenses to display the chart.
      </p>
    </div>
  );
}
