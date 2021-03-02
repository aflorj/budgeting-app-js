import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import Loading from './Loading';
import { Popover } from 'react-tiny-popover';

const currency = '€';
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth();
const months = [
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

// TODO dnd elements (also in shepherdjs)

export default function Main({ user }) {
  const [categories, setCategories] = useState([
    'True Expenses',
    'Fun',
    'Subscriptions',
  ]);
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const docRef = db
    .collection('usersdb')
    .doc(user.uid)
    .collection('budgetsByMonth');
  const docRefCurrentMonth = docRef.doc(`${currentYear}_${currentMonth}`);

  useEffect(() => {
    docRefCurrentMonth
      .get()
      .then((doc) => {
        if (doc.exists) {
          // Not a first ever (or first time this month) login from this user
          // Get data from the document and populate the app
          setBudgetData(doc.data());
          console.log(doc.data()); // LOG
          setLoading(false);
        } else {
          // First ever (or first time this month) login from this user
          // Create a new document for this month
          docRefCurrentMonth.set({
            budget: 0,
          });
          // TODO hardcoded for now but has to check db in the future when the
          // user sets some recurring expenses
          setBudgetData({
            budget: 0,
          });
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log('Error getting document:', error);
      });
  }, []);

  function handleCategoryChange(e) {
    setNewCategory(e.target.value);
  }

  function handleCategorySubmit(e) {
    e.preventDefault();

    // render the custom category
    setCategories((categories) => [...categories, newCategory]);
    setIsPopoverOpen(false);
    setNewCategory('');

    // update categories in the current month db with the new custom category
    docRefCurrentMonth.set(
      {
        expenses: {
          [newCategory]: {},
        },
      },
      { merge: true }
    );

    // TODO add the custom category to the list of this user's custom categories in the db for the future budgets
  }

  return loading ? (
    <Loading />
  ) : (
    <div className="bg-gray-100 w-full p-2">
      <div className="bg-gray-200 flex flex-initial flex-row items-center">
        <div className="ml-20">
          <p>Your budget for</p>
          <div className="font-bold text-xl">
            {months[currentMonth]} {currentYear}
          </div>
        </div>
        <div className="font-extrabold text-white p-5 ml-40 bg-green-400 rounded-md">
          {budgetData.budget.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          {currency}
          <br />
          <p className="font-normal">to be budgeted</p>
        </div>
        <div className="flex flex-col text-sm ml-2">
          <p>+0.00€ Funds for {months[currentMonth]}</p>
          <p>
            -0.00€ Overspent in{' '}
            {months[currentMonth === 0 ? 10 : currentMonth - 1]}
          </p>
          <p>-0.00€ Budgeted in {months[currentMonth]}</p>
          <p>-0.00€ Budgeted in Future</p>
        </div>
      </div>

      <Popover
        isOpen={isPopoverOpen}
        positions={['right']}
        onClickOutside={() => setIsPopoverOpen(false)}
        content={
          <div className="border-2 rounded-md">
            <form onSubmit={(e) => handleCategorySubmit(e)}>
              <input
                spellCheck="false"
                autoComplete="off"
                // add max length
                type="text"
                value={newCategory}
                onChange={(e) => handleCategoryChange(e)}
              ></input>
            </form>
          </div>
        }
      >
        <div
          className="inline-block border-2 rounded-md cursor-pointer"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          +category
        </div>
      </Popover>

      <div>
        {categories.map((x, index) => (
          <div className="underline font-bold capitalize" key={index}>
            {x}
          </div>
        ))}
      </div>
    </div>
  );
}
