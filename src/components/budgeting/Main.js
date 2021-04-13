import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase';
import Loading from './Loading';
import Charts from './Charts';
import { Popover, ArrowContainer } from 'react-tiny-popover';
import firebase from 'firebase/app';
import { MONTHS, DEFAULT_CATEGORIES } from '../../constants';
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/outline';

// TODO dealing with recurring expenses
// IDEA useEffect with budgetState updating the db?

const currency = '€'; // hard-coded for now - should be an option in the user's settings
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth();

export default function Main({ user }) {
  // renders the Loading component while the data is being fetched
  const [loading, setLoading] = useState(true);

  // all budgeting data
  const [budgetData, setBudgetData] = useState({});

  // month/year of the currently displayed budget
  const [displayedBudget, setDisplayedBudget] = useState({
    year: currentYear,
    month: currentMonth,
  });

  // popover state shared between all popovers
  // false or the name of the currently open popover
  const [openPopover, setOpenPopover] = useState(false);

  // holds user input when they are creating or editing an element
  const [userInputValue, setUserInputValue] = useState('');

  // hold user input amount when it's being edited
  const [userAmountValue, setUserAmountValue] = useState('');

  // state of the errors in the popovers
  const [popoverError, setPopoverError] = useState('');

  // focus ref
  const inputElement = useRef(null);

  // focus the popover input field when it's open
  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, [openPopover]);

  // firestore documents references
  const dbRefUser = db.collection('usersdb').doc(user.uid);
  const docRefRecurringData = dbRefUser
    .collection('recurringData')
    .doc('recurringData');
  const docRefCurrentMonth = dbRefUser // TODO var name - not really 'current' anymore
    .collection('budgetsByMonth')
    .doc(displayedBudget.year + '_' + displayedBudget.month);

  // the user logs in and main.js is rendered
  useEffect(() => {
    // check if this is a new user
    dbRefUser
      .get()
      .then((doc) => {
        if (doc.exists) {
          // EXISTING USER

          // check if this is the user's first login this month
          docRefCurrentMonth
            .get()
            .then((doc) => {
              if (doc.exists) {
                // NORMAL LOGIN

                // set local state with the data from the user's current month document
                setBudgetData(doc.data());

                // render
                setLoading(false);
              } else {
                // FIRST LOGIN THIS MONTH

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
          // NEW USER

          // set local state to the blank budget(?) and default categories
          setBudgetData({
            expenses: DEFAULT_CATEGORIES,
            inflows: [],
          });

          // Render
          setLoading(false);

          // TODO shepherdjs stuff

          // create a new document for that user
          dbRefUser.set({});

          // Blank budget
          docRefCurrentMonth.set({
            expenses: DEFAULT_CATEGORIES,
            inflows: [], // TODO
          });

          // Set user's categories to the default categories
          docRefRecurringData.set({
            expenses: DEFAULT_CATEGORIES,
            inflows: [],
          });
        }
      })
      .catch((error) => {
        console.log('Error getting the user document:', error);
      });
  }, []);

  // fetching requested document when user changes the budgeting period
  // useRef keeping track of the initial render to prevent useEffect firing and re-fetching
  const isInitialRender = useRef(true);

  // use effect fetching new data on any change to displayedBudget, except for the initial render
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    fetchNewData();
  }, [displayedBudget]);

  function fetchNewData() {
    docRefCurrentMonth
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log('doc exists');
          // user is switching to a budget that exists

          // set local state with the data from the fetch month document
          setBudgetData(doc.data());
        } else {
          console.log('doc doesnt exist');
          // user is creating a new budget document for the month

          // create a new document for that month, based on the user's recurring document
          docRefRecurringData
            .get()
            .then((doc) => {
              // local budget state set to the user's recurring doc data
              setBudgetData(doc.data());

              // set the user's current month doc the the user's recurring doc data
              docRefCurrentMonth.set(doc.data());
            })
            .catch((error) => {
              console.log('Error getting the recurring document:', error);
            });
        }
      })
      .catch((error) => {
        console.log('Error getting the requested month document:', error);
      });
  }

  // useEffect disabling the loading component when the state of the budgetData equals to the newly fetched data
  const firstTime = useRef(true);
  useEffect(() => {
    if (firstTime.current) {
      firstTime.current = false;
      return;
    }
    setLoading(false);
  }, [budgetData]);

  // closes the popover and resets the input value and the error value
  function resetPopover() {
    setOpenPopover(false);
    setUserInputValue('');
    setPopoverError('');
  }

  // prepares the category or expense edit popover
  function prepareEdit(type, element) {
    setUserInputValue(element);
    setOpenPopover(type + element);
    // using 'type_' (ex: expense_something, category_something) to prevent a bug
    // when the user creates a category, an expense and an inflow with the same name
  }

  // sets the name and the value of the expense that is being edited
  function prepareAmountEdit(element, amount) {
    setOpenPopover(element);
    if (amount === 0) {
      // this fix can be removed when/if input value is highlighted on click
      setUserAmountValue(''); // was input not amount
    } else {
      setUserAmountValue(amount); // same
    }
  }

  // handling the change in user input and resetting the error
  function handleInputChange(e) {
    setUserInputValue(e.target.value);
    setPopoverError('');
  }

  // handing the change in user input when the input is a number
  function handleAmountChange(e) {
    setUserAmountValue(e.target.value);
  }

  // adding a category
  function handleCategorySubmit(e) {
    e.preventDefault();
    const userInput = userInputValue.trim();

    // find potential duplicates
    const categoryDuplicates = budgetData.expenses.find(
      (category) =>
        category.categoryName.toLowerCase() === userInput.toLowerCase()
    );

    // first check if the category with this name already exists
    if (categoryDuplicates) {
      setPopoverError('Category already exists!');
    } else if (userInputValue.length > 0) {
      // if user entered a unique name for the new category
      // check if the name is valid
      if (userInput.length > 0) {
        // add the new custom category to the local state
        setBudgetData((budgetData) => ({
          ...budgetData,
          expenses: [
            ...budgetData.expenses,
            {
              categoryName: userInput,
              expensesInCategory: [],
            },
          ],
        }));

        // update user's categories in the recurring document
        docRefRecurringData.update({
          expenses: firebase.firestore.FieldValue.arrayUnion({
            categoryName: userInput,
            expensesInCategory: [],
          }),
        });

        // update user's categories in the user's current month document
        docRefCurrentMonth.update({
          expenses: firebase.firestore.FieldValue.arrayUnion({
            categoryName: userInput,
            expensesInCategory: [],
          }),
        });
        // reset the category popover
        resetPopover();
      } else {
        setPopoverError('Invalid category name!');
      }
    } else {
      // user didn't enter anything
      resetPopover();
    }
  }

  // adding an expense
  function handleExpenseSubmit(e, category) {
    e.preventDefault();
    const userInput = userInputValue.trim();

    // array of all the expenses in the user's budget so we can compare for duplicates
    const allExpenses = [];
    budgetData.expenses.forEach((category) =>
      category.expensesInCategory.forEach((expense) =>
        allExpenses.push(expense.expense)
      )
    );
    const expenseDuplicates = allExpenses.find(
      (expense) => expense.toLowerCase() === userInput.toLowerCase()
    );

    // first check if the category with this name already exists
    if (expenseDuplicates) {
      setPopoverError('Expense already exists!');
    } else if (userInputValue.length > 0) {
      // if user entered a unique name for the new category
      // check if the name is valid
      if (userInput.length > 0) {
        // find the index of the category that we want to add an expense to
        const elementsIndex = budgetData.expenses.findIndex(
          (element) => element.categoryName === category
        );

        // create a copy of the expenses array
        // and update the copy with the new expense
        let newArrayOfExpenses = [...budgetData.expenses];
        newArrayOfExpenses[elementsIndex].expensesInCategory.push({
          expense: userInput,
          amount: 0,
        });

        // add the expense to the local state
        setBudgetData((budgetData) => ({
          ...budgetData,
          expenses: newArrayOfExpenses,
        }));

        // update the database with the new expense
        // TODO update user's categories in the recurring document
        // IF the expense is recurring

        // update user's expenses in the user's current month document
        docRefCurrentMonth.set(
          {
            expenses: budgetData.expenses,
          },
          { merge: true }
        );

        // reset the expense popover
        resetPopover();
      } else {
        setPopoverError('Invalid expense name!');
      }
    } else {
      // user didn't enter anything
      resetPopover();
    }
  }

  // adding an inflow
  function handleInflowSubmit(e) {
    e.preventDefault();
    const userInput = userInputValue.trim();

    // find potential duplicates
    const inflowDuplicates = budgetData.inflows.find(
      (inflow) => inflow.inflowName.toLowerCase() === userInput.toLowerCase()
    );

    // first check if the inflow with this name already exists
    if (inflowDuplicates) {
      setPopoverError('Inflow already exists!');
    } else if (userInputValue.length > 0) {
      // if user entered a unique name for the new inflow
      // check if the name is valid
      if (userInput.length > 0) {
        // add the new custom inflow to the local state
        setBudgetData((budgetData) => ({
          ...budgetData,
          inflows: [
            ...budgetData.inflows,
            {
              inflowName: userInput,
              amount: 0,
            },
          ],
        }));

        // update user's inflows in the user's current month document
        docRefCurrentMonth.update({
          inflows: firebase.firestore.FieldValue.arrayUnion({
            inflowName: userInput,
            amount: 0,
          }),
        });
        // reset the inflow popover
        resetPopover();
      } else {
        setPopoverError('Invalid inflow name!');
      }
    } else {
      // user didn't enter anything
      resetPopover();
    }
  }

  // renaming a category
  function handleCategoryEditSubmit(e, category) {
    e.preventDefault();
    const userInput = userInputValue.trim();

    // potential duplicates
    const categoryDuplicates = budgetData.expenses.find(
      (category) =>
        category.categoryName.toLowerCase() === userInput.toLowerCase()
    );

    // first check if there were any changes to the category name
    if (category === userInput) {
      // no changes, close the popover
      resetPopover();
    } else {
      // changes were made, check if the new name is valid
      if (userInputValue.length > 0) {
        if (userInput.length > 0) {
          // valid input but still need to check for duplicates
          if (categoryDuplicates) {
            // the new category name is not uniue, throw an error and leave the popover open
            setPopoverError('Category already exists!');
          } else {
            // the new categoty name is unique
            // change the category name and close the popover

            // find the index of the category that we want to edit the name of
            const elementsIndex = budgetData.expenses.findIndex(
              (element) => element.categoryName === category
            );

            // create a copy of the expenses array
            // find the correct category and rename it
            let expensesArrayCopy = [...budgetData.expenses];
            expensesArrayCopy[elementsIndex].categoryName = userInput;

            setBudgetData((budgetData) => ({
              ...budgetData,
              expenses: expensesArrayCopy,
            }));

            // apply the changes to the db
            docRefCurrentMonth.set(
              {
                expenses: budgetData.expenses,
              },
              { merge: true }
            );
            // reset the category popover
            resetPopover();
          }
        } else {
          //invalid input, throw an error and leave the popover open
          setPopoverError('Invalid category name!');
        }
      } else {
        // user cleared the input - cancel the edit
        resetPopover();
      }
    }
  }

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
      resetPopover();
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

            // apply the changes to the local state
            // copy of the array of the expenses in the category the edited expense belongs to
            let expensesArrayCopy = [...budgetData.expenses];
            expensesArrayCopy[indexOfCategory].expensesInCategory[
              indexOfExpense
            ].expense = userInput;
            setBudgetData((budgetData) => ({
              ...budgetData,
              expenses: expensesArrayCopy,
            }));

            // apply the changes to the db
            docRefCurrentMonth.set(
              {
                expenses: budgetData.expenses,
              },
              { merge: true }
            );
            // reset the expense popover
            resetPopover();
          }
        } else {
          // invalid input, throw an error and leave the popover open
          setPopoverError('Invalid expense name!');
        }
      } else {
        // user cleared the input - cancel the edit
        resetPopover();
      }
    }
  }

  // renaming an inflow
  function handleInflowEditSubmit(e, inflow) {
    e.preventDefault();
    const userInput = userInputValue.trim();

    // potential duplicates
    const inflowDuplicates = budgetData.inflows.find(
      (element) => element.inflowName.toLowerCase() === userInput.toLowerCase()
    );

    // first check if there were any changes to the inflow name
    if (inflow === userInput) {
      // no changes, close the popover
      resetPopover();
    } else {
      // changes were made, check if the new name is valid
      if (userInputValue.length > 0) {
        if (userInput.length > 0) {
          // valid input but still need to check for duplicates
          if (inflowDuplicates) {
            // the new inflow name is not unique, throw an error and leave the popover open
            setPopoverError('Inflow already exists!');
          } else {
            // the new inflow name is unique
            // change the inflow name and close the popover

            // find the index of the inflow that we want to edit the name of
            const inflowsIndex = budgetData.inflows.findIndex(
              (element) => element.inflowName === inflow
            );

            // create a copy of the inflows array
            // find the correct inflow and rename it
            let inflowsArrayCopy = [...budgetData.inflows];
            inflowsArrayCopy[inflowsIndex].inflowName = userInput;

            setBudgetData((budgetData) => ({
              ...budgetData,
              inflows: inflowsArrayCopy,
            }));

            // apply the changes to the db
            docRefCurrentMonth.set(
              {
                inflows: budgetData.inflows,
              },
              { merge: true }
            );
            // reset the inflows popover
            resetPopover();
          }
        } else {
          // invalid input, throw an error and leave the popover open
          setPopoverError('Invalid inflow name!');
        }
      } else {
        // user cleared the input - cancel the edit
        resetPopover();
      }
    }
  }

  // removing a category
  // TODO handling the recurring doc
  function deleteCategory(e, category) {
    e.preventDefault();

    // find the index of the object we're removing from the array
    const indexToRemove = budgetData.expenses.findIndex(
      (element) => element.categoryName === category
    );

    // delete the category from the local state
    let expensesArrayCopy = [...budgetData.expenses];
    expensesArrayCopy.splice(indexToRemove, 1);
    setBudgetData((budgetData) => ({
      ...budgetData,
      expenses: expensesArrayCopy,
    }));

    // delete the category from the db
    // firestore "arrayRemove" requires an exact copy of the object being removed
    // our data is normalized so we can find the exact object in our local state
    const objectToRemove = budgetData.expenses[indexToRemove];

    // 'current month' document
    docRefCurrentMonth.update({
      expenses: firebase.firestore.FieldValue.arrayRemove(objectToRemove),
    });

    // 'recurring' document
    docRefRecurringData.update({
      expenses: firebase.firestore.FieldValue.arrayRemove(objectToRemove),
    });

    setOpenPopover(false);
  }

  // removing an expense
  // TODO handling the recurring doc
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

    // apply the changes to the local state
    // copy of the array of the expenses in the category the deleted expense belongs to
    let expensesArrayCopy = [...budgetData.expenses];
    expensesArrayCopy[indexOfCategory].expensesInCategory.splice(
      indexOfExpense,
      1
    );
    setBudgetData((budgetData) => ({
      ...budgetData,
      expenses: expensesArrayCopy,
    }));

    // apply the changes to the db
    docRefCurrentMonth.set(
      {
        expenses: budgetData.expenses,
      },
      { merge: true }
    );

    // TODO recurring doc

    setOpenPopover(false);
  }

  // removing an inflow
  // TODO handling the recurring doc
  function deleteInflow(e, inflow) {
    e.preventDefault();

    // find the index of the object we're removing from the array
    const indexToRemove = budgetData.inflows.findIndex(
      (element) => element.inflowName === inflow
    );

    // delete the inflow from the local data
    let inflowsArrayCopy = [...budgetData.inflows];
    inflowsArrayCopy.splice(indexToRemove, 1);
    setBudgetData((budgetData) => ({
      ...budgetData,
      inflows: inflowsArrayCopy,
    }));

    // delete the inflow from the db
    const objectToRemove = budgetData.inflows[indexToRemove];

    // 'current month' document
    docRefCurrentMonth.update({
      inflows: firebase.firestore.FieldValue.arrayRemove(objectToRemove),
    });

    // 'recurring' document
    docRefRecurringData.update({
      inflows: firebase.firestore.FieldValue.arrayRemove(objectToRemove),
    });

    setOpenPopover(false);
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
      let expensesArrayCopy = [...budgetData.expenses];
      expensesArrayCopy[indexOfCategory].expensesInCategory[
        indexOfExpense
      ].amount = 0;

      // set it to zero in the local state
      setBudgetData((budgetData) => ({
        ...budgetData,
        expenses: expensesArrayCopy,
      }));

      // set it to zero in the db
      docRefCurrentMonth.set(
        {
          expenses: budgetData.expenses,
        },
        { merge: true }
      );
    } else {
      // the user has changed the amount of this expense and did not leave the input field empty
      // and the value of the input was a number
      if (
        expenseObject.amount !== parseFloat(userAmountValue) &&
        !isNaN(userAmountValue)
      ) {
        // apply the changes to the local state
        // copy of the array of the expenses in the category the edited expense belongs to
        let expensesArrayCopy = [...budgetData.expenses];
        expensesArrayCopy[indexOfCategory].expensesInCategory[
          indexOfExpense
        ].amount = parseFloat(userAmountValue);
        setBudgetData((budgetData) => ({
          ...budgetData,
          expenses: expensesArrayCopy,
        }));

        //and db changes
        docRefCurrentMonth.set(
          {
            expenses: budgetData.expenses,
          },
          { merge: true }
        );
        // TODO recurring
      }
    }

    setOpenPopover(false);
  }

  // changing the amount of an inflow
  function handleInflowAmountSubmit(e, inflow) {
    e.preventDefault();

    // the index of the inflow and a copy of the inflows array
    const indexOfInflow = budgetData.inflows.findIndex(
      (element) => element.inflowName === inflow.inflowName
    );
    let inflowsArrayCopy = [...budgetData.inflows];

    // clearing the input and submitting equals to setting the inflow amount to zero
    if (userAmountValue.length === 0) {
      inflowsArrayCopy[indexOfInflow].amount = 0;

      // set it to zero in the local state
      setBudgetData((budgetData) => ({
        ...budgetData,
        inflows: inflowsArrayCopy,
      }));

      // set it to zero in the db
      docRefCurrentMonth.set(
        {
          inflows: budgetData.inflows,
        },
        { merge: true }
      );
    } else {
      // the user has changed the amount of this inflow and did not leave the input field empty
      // and the value of the input was a number
      if (
        inflow.amount !== parseFloat(userAmountValue) &&
        !isNaN(userAmountValue)
      ) {
        // apply the changes to the local state
        inflowsArrayCopy[indexOfInflow].amount = parseFloat(userAmountValue);
        setBudgetData((budgetData) => ({
          ...budgetData,
          inflows: inflowsArrayCopy,
        }));

        // and db changes
        docRefCurrentMonth.set(
          {
            inflows: budgetData.inflows,
          },
          { merge: true }
        );
        // TODO recurring
      }
    }

    setOpenPopover(false);
  }

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

  return loading ? (
    <Loading />
  ) : (
    <div className="bg-gray-100 p-2 flex flex-col mt-4 mb-8 mx-8 rounded-lg shadow-lg min-h-full">
      {/* head start */}
      <div className="bg-green-100 flex flex-row items-center rounded-lg shadow-lg m-2">
        <div className="ml-20 flex items-center">
          {true && (
            // TODO replace 'true' with a function that checks for previous budgets from this user
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
          {currency}
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
            {currency} Funds for {MONTHS[displayedBudget.month]}
          </p>
          <p>
            -0.00€ Overspent in{' '}
            {
              MONTHS[
                displayedBudget.month === 0 ? 11 : displayedBudget.month - 1
              ]
            }
          </p>
          <p>
            -
            {calculateAlreadyBudgeted().toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {currency} Budgeted in {MONTHS[displayedBudget.month]}
          </p>
          <p>-0.00€ Budgeted in Future</p>
        </div>
      </div>
      {/* head end */}
      {/* core start */}
      <div className="flex flex-col lg:flex-row">
        {/* left side of the core start */}
        <div className="overflow-y-auto m-2 flex-col space-y-2 w-1/2">
          <div id="all-inflows-wrapper" className="flex flex-col">
            <div className="flex items-center">
              <p className="text-xl font-bold underline">Inflows</p>
              {/* add in inflow popover - start */}
              <Popover
                isOpen={openPopover === 'inflow'}
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
                      <form onSubmit={(e) => handleInflowSubmit(e)}>
                        <input
                          className="border-2 border-blue-400 focus:border-blue-300 rounded-sm py-1 px-2 focus:ring-10"
                          spellCheck="false"
                          autoComplete="off"
                          placeholder="New Inflow"
                          maxLength="64"
                          type="text"
                          ref={inputElement}
                          value={userInputValue}
                          onChange={(e) => handleInputChange(e)}
                        />
                        {popoverError && (
                          <div className="text-sm text-red-500">
                            {popoverError}
                          </div>
                        )}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => resetPopover()}
                            className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                          >
                            OK
                          </button>
                        </div>
                      </form>
                    </div>
                  </ArrowContainer>
                )}
              >
                <div className="inline-block">
                  <button
                    className="focus:outline-white border-2 border-green-300 bg-gray-100 hover:bg-green-300 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer ml-1 opacity-50 hover:opacity-100 transform transition hover:scale-125"
                    onClick={() =>
                      openPopover === 'inflow'
                        ? resetPopover()
                        : setOpenPopover('inflow')
                    }
                  >
                    +
                  </button>
                </div>
              </Popover>
              {/* add an inflow popover - end */}
            </div>
            <div>
              {budgetData.inflows.length ? (
                budgetData.inflows.map((inflow) => (
                  <div className="flex space-x-2">
                    <div>
                      <div className="cursor-pointer">
                        {/* edit an inflow popover - start */}
                        <Popover
                          isOpen={openPopover === 'inflow_' + inflow.inflowName}
                          positions={['bottom', 'top']}
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
                                <form
                                  onSubmit={(e) =>
                                    handleInflowEditSubmit(e, inflow.inflowName)
                                  }
                                >
                                  <input
                                    className="border-2 border-blue-400 focus:border-blue-300 rounded-sm py-1 px-2 focus:ring-10"
                                    spellCheck="false"
                                    autoComplete="off"
                                    maxLength="64"
                                    type="text"
                                    placeholder="New name for this category"
                                    ref={inputElement}
                                    value={userInputValue}
                                    onChange={(e) => handleInputChange(e)}
                                  />
                                  {popoverError && (
                                    <div className="text-sm text-red-500">
                                      {popoverError}
                                    </div>
                                  )}
                                  <div className="pt-2 flex justify-between">
                                    <button
                                      type="button"
                                      onClick={(e) =>
                                        deleteInflow(e, inflow.inflowName)
                                      }
                                      className="text-red-500 hover:bg-red-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                                    >
                                      Delete
                                    </button>
                                    <div className="flex">
                                      <button
                                        type="button"
                                        onClick={() => resetPopover()}
                                        className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                                      >
                                        OK
                                      </button>
                                    </div>
                                  </div>
                                </form>
                              </div>
                            </ArrowContainer>
                          )}
                        >
                          <div
                            className="pl-2 flex hover:text-gray-600"
                            onClick={() =>
                              openPopover === 'inflow_' + inflow.inflowName
                                ? resetPopover()
                                : prepareEdit('inflow_', inflow.inflowName)
                            }
                          >
                            {inflow.inflowName}
                          </div>
                        </Popover>
                        {/* edit an inflow popover - end  */}
                      </div>
                    </div>

                    <div className="px-1 flex">
                      <form
                        onSubmit={(e) => handleInflowAmountSubmit(e, inflow)}
                      >
                        <input
                          className="text-right bg-gray-100 cursor-pointer focus:bg-white hover:text-gray-600"
                          id="inflow-amount"
                          key={inflow.inflowName}
                          type="text"
                          onClick={() =>
                            prepareAmountEdit(inflow.inflowName, inflow.amount)
                          }
                          onChange={(e) => handleAmountChange(e)}
                          onBlur={(e) => handleInflowAmountSubmit(e, inflow)}
                          spellCheck="false"
                          autoComplete="false"
                          value={
                            openPopover === inflow.inflowName
                              ? userAmountValue
                              : inflow.amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                          }
                        />
                      </form>
                      {currency}
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-2 italic text-gray-700">No inflows.</div>
              )}
            </div>
          </div>
          <div id="all-expenses-wrapper" className="">
            <div id="little-wrapper" className="flex space-x-1 items-end">
              <p className="text-xl font-bold underline">Expenses</p>
              {/* adding a category popover - start */}
              <Popover
                isOpen={openPopover === 'addCategory'}
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
                          className="border-2 border-blue-400 focus:border-blue-300 rounded-sm py-1 px-2 focus:ring-10"
                          spellCheck="false"
                          autoComplete="off"
                          placeholder="New Category"
                          maxLength="64"
                          type="text"
                          ref={inputElement}
                          value={userInputValue}
                          onChange={(e) => handleInputChange(e)}
                        />
                        {popoverError && (
                          <div className="text-sm text-red-500">
                            {popoverError}
                          </div>
                        )}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => resetPopover()}
                            className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                          >
                            OK
                          </button>
                        </div>
                      </form>
                    </div>
                  </ArrowContainer>
                )}
              >
                <button
                  className="focus:outline-white inline-block px-1 border-2 border-green-300 bg-gray-100 hover:bg-green-300 rounded-md cursor-pointer text-sm"
                  onClick={() =>
                    openPopover === 'addCategory'
                      ? setOpenPopover(false)
                      : setOpenPopover('addCategory')
                  }
                >
                  + Category
                </button>
              </Popover>
              {/* adding a category popover - end */}
            </div>
            <div>
              {budgetData.expenses.length ? (
                budgetData.expenses.map((el) => (
                  <div className="p-2" key={el.categoryName}>
                    {/* editing a category popover - start */}
                    <Popover
                      isOpen={openPopover === 'category_' + el.categoryName}
                      positions={['bottom', 'top']}
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
                            <form
                              onSubmit={(e) =>
                                handleCategoryEditSubmit(e, el.categoryName)
                              }
                            >
                              <input
                                className="border-2 border-blue-400 focus:border-blue-300 rounded-sm py-1 px-2 focus:ring-10"
                                spellCheck="false"
                                autoComplete="off"
                                maxLength="64"
                                type="text"
                                placeholder="New name for this category"
                                ref={inputElement}
                                value={userInputValue}
                                onChange={(e) => handleInputChange(e)}
                              />
                              {popoverError && (
                                <div className="text-sm text-red-500">
                                  {popoverError}
                                </div>
                              )}
                              <div className="pt-2 flex justify-between">
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    deleteCategory(e, el.categoryName)
                                  }
                                  className="text-red-500 hover:bg-red-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                                >
                                  Delete
                                </button>
                                <div className="flex">
                                  <button
                                    type="button"
                                    onClick={() => resetPopover()}
                                    className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                                  >
                                    OK
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </ArrowContainer>
                      )}
                    >
                      <div
                        className="cursor-pointer capitalize font-bold bg-blue-100 hover:bg-blue-300 inline-block border-2 border-blue-300 rounded-md px-1"
                        onClick={() =>
                          openPopover === 'category_' + el.categoryName
                            ? resetPopover()
                            : prepareEdit('category_', el.categoryName)
                        }
                      >
                        {el.categoryName}
                      </div>
                    </Popover>
                    {/* editing a category popover - start */}
                    {/* adding an expense popover - start */}
                    <Popover
                      isOpen={openPopover === 'addExpense_' + el.categoryName}
                      positions={['right']}
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
                            <form
                              onSubmit={(e) =>
                                handleExpenseSubmit(e, el.categoryName)
                              }
                            >
                              <input
                                className="border-2 border-blue-400 focus:border-blue-300 rounded-sm py-1 px-2 focus:ring-10"
                                spellCheck="false"
                                autoComplete="off"
                                placeholder="New Expense"
                                maxLength="64"
                                type="text"
                                ref={inputElement}
                                value={userInputValue}
                                onChange={(e) => handleInputChange(e)}
                              />
                              {popoverError && (
                                <div className="text-sm text-red-500">
                                  {popoverError}
                                </div>
                              )}
                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => resetPopover()}
                                  className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                                >
                                  OK
                                </button>
                              </div>
                            </form>
                          </div>
                        </ArrowContainer>
                      )}
                    >
                      <div className="inline-block">
                        <button
                          className="focus:outline-white border-2 border-green-300 bg-gray-100 hover:bg-green-300 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer ml-1 opacity-50 hover:opacity-100 transform transition hover:scale-125"
                          onClick={() =>
                            openPopover === 'addExpense_' + el.categoryName
                              ? resetPopover()
                              : setOpenPopover('addExpense_' + el.categoryName)
                          }
                        >
                          +
                        </button>
                      </div>
                    </Popover>
                    {/* adding an expense popover - end */}
                    {el.expensesInCategory.length ? (
                      el.expensesInCategory.map((expenseObject) => (
                        <div
                          // border before hover is the same color as background
                          className="border-b-2 border-gray-100 hover:border-gray-400 pl-2 flex justify-between"
                          id="expense-line"
                          key={expenseObject.expense}
                        >
                          <div className="cursor-pointer">
                            {/* editing an expense - start */}
                            <Popover
                              isOpen={
                                openPopover ===
                                'expense_' + expenseObject.expense
                              }
                              positions={['bottom', 'top']}
                              onClickOutside={() => resetPopover()}
                              content={({
                                position,
                                childRect,
                                popoverRect,
                              }) => (
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
                                          el.categoryName,
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
                                        placeholder="New name for this expense"
                                        value={userInputValue}
                                        ref={inputElement}
                                        onChange={(e) => handleInputChange(e)}
                                      />
                                      {popoverError && (
                                        <div className="text-sm text-red-500">
                                          {popoverError}
                                        </div>
                                      )}
                                      <div className="pt-2 flex justify-between">
                                        <button
                                          type="button"
                                          onClick={(e) =>
                                            deleteExpense(
                                              e,
                                              el.categoryName,
                                              expenseObject.expense
                                            )
                                          }
                                          className="text-red-500 hover:bg-red-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                                        >
                                          Delete
                                        </button>
                                        <div className="flex">
                                          <button
                                            type="button"
                                            onClick={() => resetPopover()}
                                            className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="submit"
                                            className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                                          >
                                            OK
                                          </button>
                                        </div>
                                      </div>
                                    </form>
                                  </div>
                                </ArrowContainer>
                              )}
                            >
                              <div
                                className="pl-2 flex hover:text-gray-600"
                                // ta CN je meu tud justify-between, why?
                                id="expense-name"
                                onClick={() =>
                                  openPopover ===
                                  'expense_' + expenseObject.expense
                                    ? resetPopover()
                                    : prepareEdit(
                                        'expense_',
                                        expenseObject.expense
                                      )
                                }
                              >
                                {expenseObject.expense}
                              </div>
                            </Popover>
                            {/* editing an expense - end */}
                          </div>
                          <div className="px-1 flex">
                            <form
                              onSubmit={(e) =>
                                handleAmountSubmit(
                                  e,
                                  el.categoryName,
                                  expenseObject
                                )
                              }
                            >
                              <input
                                className="text-right bg-gray-100 cursor-pointer focus:bg-white hover:text-gray-600"
                                id="amount"
                                key={expenseObject.expense}
                                type="text"
                                onClick={() =>
                                  prepareAmountEdit(
                                    expenseObject.expense,
                                    expenseObject.amount
                                  )
                                }
                                onChange={(e) => handleAmountChange(e)}
                                onBlur={(e) =>
                                  handleAmountSubmit(
                                    e,
                                    el.categoryName,
                                    expenseObject
                                  )
                                }
                                spellCheck="false"
                                autoComplete="off"
                                value={
                                  openPopover === expenseObject.expense
                                    ? userAmountValue
                                    : expenseObject.amount.toLocaleString(
                                        undefined,
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )
                                }
                              />
                            </form>
                            {currency}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>
                        <p className="pl-2 italic text-gray-700">
                          No expenses in this category.
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div>
                  <p className="p-2 italic text-gray-700">
                    Start building your budget by creating a category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* left side of the core end */}
        {/* right side of the core start */}
        <div className="w-1/2 m-2">
          <Charts expenses={budgetData.expenses} />
        </div>
        {/* right side of the core end */}
      </div>
      {/* core end */}
    </div>
  );
}
