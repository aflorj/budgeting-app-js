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

const defaultCategories = {
  'immediate obligations': {
    rent: 0,
    electric: 0,
    water: 0,
    internet: 0,
    groceries: 0,
    gas: 0,
  },
  'true expenses': {
    'car maintenance': 0,
    'home maintenance': 0,
    'medical insurance': 0,
    'car insurance': 0,
    'home insurance': 0,
    clothing: 0,
    gifts: 0,
    electronics: 0,
  },
  'quality of life': {
    vacation: 0,
    'gym membership': 0,
    education: 0,
  },
  subscriptions: {
    netflix: 0,
    spotify: 0,
  },
  fun: {
    gaming: 0,
    music: 0,
    'dining out': 0,
  },
};

// TODO drag and drop

export default function Main({ user }) {
  const [categories, setCategories] = useState([]); // refactor state
  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const dbRefUser = db.collection('usersdb').doc(user.uid);
  const docRefRecurringData = dbRefUser
    .collection('recurringData')
    .doc('recurringData');
  const docRefCurrentMonth = dbRefUser
    .collection('budgetsByMonth')
    .doc(`${currentYear}_${currentMonth}`);

  useEffect(() => {
    // check if this is a new user
    dbRefUser
      .get()
      .then((doc) => {
        if (doc.exists) {
          // this is not a new user
          // check if this is the user's first login this month
          docRefCurrentMonth
            .get()
            .then((doc) => {
              if (doc.exists) {
                // this is not the user's first login this month
                // set state with the data from the user's current month document
                setBudgetData(doc.data()); // refactor state
                setCategories(doc.data().expenses);
                console.log(doc.data()); // DELETE LINE
                setLoading(false);
              } else {
                // this is the user's first login this month
                // create a new document for this month
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
              console.log('Error getting the current month document:', error);
            });
        } else {
          // this is a new user
          // set local state to the blank budget and default categories
          setCategories(defaultCategories);
          setBudgetData({
            budget: 0,
          });

          // Render
          setLoading(false);

          // TODO shepherdjs stuff

          // create a new document for that user
          dbRefUser.set({});

          // Blank budget
          docRefCurrentMonth.set({
            budget: 0, // TODO remove when calculating budget is working
            expenses: defaultCategories,
            inflows: 0, // TODO
          });

          // Set user's categories to the default categories
          docRefRecurringData.set({
            expenses: defaultCategories,
          });
        }
      })
      .catch((error) => {
        console.log('Error getting the user document:', error);
      });
  }, []);

  function handleCategoryChange(e) {
    setNewCategory(e.target.value);
  }

  function handleCategorySubmit(e) {
    e.preventDefault();

    // render the custom category
    setCategories((categories) => ({ ...categories, [newCategory]: '' }));
    setIsPopoverOpen(false);
    setNewCategory('');

    // update user's categories in the recurring document
    docRefRecurringData.set(
      {
        expenses: {
          [newCategory]: {},
        },
      },
      { merge: true }
    );

    // update user's categories in the user's current month document
    docRefCurrentMonth.set(
      {
        expenses: {
          [newCategory]: {},
        },
      },
      { merge: true }
    );
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
                // TODO add max length
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
        {Object.keys(categories).map((x, index) => (
          <div className="underline font-bold capitalize" key={index}>
            {x}
          </div>
        ))}
      </div>
    </div>
  );
}
