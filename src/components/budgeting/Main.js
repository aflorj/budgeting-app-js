import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import Loading from './Loading';
import { Popover, ArrowContainer } from 'react-tiny-popover';
import firebase from 'firebase/app';

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

const defaultCategories = [
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

// TODO drag and drop

export default function Main({ user }) {
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

                // set local state with the data from the user's current month document
                setBudgetData(doc.data());

                // render
                setLoading(false);
              } else {
                // this is the user's first login this month

                // create a new document for this month, based on the user's recurring data
                docRefRecurringData
                  .get()
                  .then((doc) => {
                    // local budget state set to the user's recurring doc data
                    setBudgetData(doc.data());

                    // render
                    setLoading(false);

                    // set the user's current month doc the the user's recurring doc data
                    docRefCurrentMonth.set(doc.data());
                  })
                  .catch((error) => {
                    console.log('Error getting the recurring document:', error);
                  });
              }
            })
            .catch((error) => {
              console.log('Error getting the current month document:', error);
            });
        } else {
          // this is a new user
          // set local state to the blank budget(?) and default categories
          setBudgetData({
            budget: 0,
            expenses: defaultCategories,
            inflows: 0,
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

  function resetPopover() {
    setIsPopoverOpen(false);
    setNewCategory('');
  }

  function handleCategoryChange(e) {
    setNewCategory(e.target.value);
  }

  function handleCategorySubmit(e) {
    e.preventDefault();

    // if user entered a name for the new category
    // add the new custom category to the local state
    if (newCategory.length > 0) {
      setBudgetData((budgetData) => ({
        ...budgetData,
        expenses: [
          ...budgetData.expenses,
          {
            categoryName: newCategory,
            expensesInCategory: [],
          },
        ],
      }));

      // close and reset the popover
      resetPopover();

      // update user's categories in the recurring document
      docRefRecurringData.update({
        expenses: firebase.firestore.FieldValue.arrayUnion({
          categoryName: newCategory,
          expensesInCategory: [],
        }),
      });

      // update user's categories in the user's current month document
      docRefCurrentMonth.update({
        expenses: firebase.firestore.FieldValue.arrayUnion({
          categoryName: newCategory,
          expensesInCategory: [],
        }),
      });
    } else {
      // user didn't enter anything
      setIsPopoverOpen(false);
    }
  }

  return loading ? (
    <Loading />
  ) : (
    <div className="bg-gray-100 w-full p-2 flex flex-col max-h-screen">
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

      <div className="overflow-y-auto m-2">
        <Popover
          isOpen={isPopoverOpen}
          positions={['bottom', 'right']}
          onClickOutside={() => resetPopover()}
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
                <form onSubmit={(e) => handleCategorySubmit(e)}>
                  <input
                    className="border-2 border-blue-400 focus:placeholder-transparent focus:border-blue-300 rounded-sm p-1 focus:ring-10"
                    spellCheck="false"
                    autoComplete="off"
                    placeholder="New Category"
                    maxLength="64"
                    type="text"
                    value={newCategory}
                    onChange={(e) => handleCategoryChange(e)}
                  ></input>
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => resetPopover()}
                      className="text-blue pl-1 pr-1 rounded-md border-2 border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-400 text-white ml-2 pl-4 pr-4 rounded-md border-2 border-gray-300"
                    >
                      OK
                    </button>
                  </div>
                </form>
              </div>
            </ArrowContainer>
          )}
        >
          <div
            className="inline-block border-2 rounded-md cursor-pointer"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            + Category
          </div>
        </Popover>
        <div>
          {budgetData.expenses.map((el) => (
            <div className="p-2" key={el.categoryName}>
              <div className="capitalize font-bold bg-blue-200 inline-block border-2 border-blue-300 rounded-md pl-1 pr-1">
                {el.categoryName}
              </div>
              {el.expensesInCategory.map((cat) => (
                <div
                  className="capitalize border-b-2 hover:bg-blue-100 hover:border-gray-400 pl-2 flex justify-between"
                  key={cat.expense}
                >
                  <div>{cat.expense}</div>
                  <div>
                    {cat.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {currency}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
