import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import Loading from './Loading';
import { Popover, ArrowContainer } from 'react-tiny-popover';
import firebase from 'firebase/app';
import { MONTHS, DEFAULT_CATEGORIES } from '../../constants';

const currency = '€'; // hard-coded for now - should be an option in the user's settings
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth();

export default function Main({ user }) {
  // renders loading component until the data is available to be rendered
  const [loading, setLoading] = useState(true);

  // all budgeting data
  const [budgetData, setBudgetData] = useState('');

  // 'add category' popover - true or false
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // holds input value from the user when creating a new category or an expense
  // shared state because the user can't create a category and an expense simultaneously
  const [newCategoryOrExpense, setnewCategoryOrExpense] = useState('');

  // state of the 'create an expense' popup
  // 'false' when closed or holds the name of the category under which the expense is being added
  const [openElementName, setOpenElementName] = useState(false);

  // state of the 'edit a category' and 'edit an expense' popup
  // 'false' when closed or holds the name of the category/expense being edited
  const [openEditCategory, setOpenEditCategory] = useState(false);
  const [openEditExpense, setOpenEditExpense] = useState(false);

  // when editing a category or an expense, set the starting value of the input
  // to the current name of the category or the expense being edited
  const [nowEditingCategory, setNowEditingCategory] = useState('');
  const [nowEditingExpense, setNowEditingExpense] = useState('');

  // editing an amount
  // which expense's amount is being edited
  const [nowEditingAmount, setNowEditingAmount] = useState(false);
  // the value of that expense's amount
  const [valueOfAmount, setValueOfAmount] = useState('');

  // state of errors in popovers
  const [popoverError, setPopoverError] = useState('Category already exists!');

  // firestore documents references
  const dbRefUser = db.collection('usersdb').doc(user.uid);
  const docRefRecurringData = dbRefUser
    .collection('recurringData')
    .doc('recurringData');
  const docRefCurrentMonth = dbRefUser
    .collection('budgetsByMonth')
    .doc(`${currentYear}_${currentMonth}`);

  // the user logs in and main.js is rendered
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
            expenses: DEFAULT_CATEGORIES,
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
            expenses: DEFAULT_CATEGORIES,
            inflows: 0, // TODO
          });

          // Set user's categories to the default categories
          docRefRecurringData.set({
            expenses: DEFAULT_CATEGORIES,
          });
        }
      })
      .catch((error) => {
        console.log('Error getting the user document:', error);
      });
  }, []);

  // closes the 'create a category' popup and resets the input value and the popover error
  function resetCategoryPopover() {
    setIsPopoverOpen(false);
    setnewCategoryOrExpense('');
    setPopoverError('');
  }

  // closes the 'create an expense' popup and resets the input value and the popover error
  function resetExpensePopover() {
    setOpenElementName(false);
    setnewCategoryOrExpense('');
    setPopoverError('');
  }

  // closes the 'edit a category' popup and resets the input value and the popover error
  function resetCategoryEdit() {
    setOpenEditCategory(false);
    setNowEditingCategory('');
    setPopoverError('');
  }

  // closes the 'edit an expense' popup and resets the input value and the popover error
  function resetExpenseEdit() {
    setOpenEditExpense(false);
    setNowEditingExpense('');
    setPopoverError('');
  }

  // opens the edit category popover and sets the input value
  // to the category that is being edited
  function prepareCategoryEdit(category) {
    setNowEditingCategory(category);
    setOpenEditCategory(category);
  }

  // opens the edit expense popover and sets the input value
  // to the expense that is being edited
  function prepareExpenseEdit(expense) {
    setNowEditingExpense(expense);
    setOpenEditExpense(expense);
  }

  // sets the name and the value of the expense that is being edited
  function prepareAmountEdit(expenseObject) {
    setNowEditingAmount(expenseObject.expense);
    if (expenseObject.amount === 0) {
      // this fix can be removed when/if input value is highlighted on click
      setValueOfAmount('');
    } else {
      setValueOfAmount(expenseObject.amount);
    }
  }

  function handleCategoryOrExpenseChange(e) {
    setnewCategoryOrExpense(e.target.value);
    setPopoverError('');
  }

  function handleCategoryEditChange(e) {
    setNowEditingCategory(e.target.value);
    setPopoverError('');
  }

  function handleExpenseEditChange(e) {
    setNowEditingExpense(e.target.value);
    setPopoverError('');
  }

  function handleAmountEditChange(e) {
    setValueOfAmount(e.target.value);
  }

  function handleCategorySubmit(e) {
    e.preventDefault();
    const userInput = newCategoryOrExpense.trim();

    // find potential duplicates
    const categoryDuplicates = budgetData.expenses.find(
      (category) =>
        category.categoryName.toLowerCase() === userInput.toLowerCase()
    );

    // first check if the category with this name already exists
    if (categoryDuplicates) {
      setPopoverError('Category already exists!');
    } else if (newCategoryOrExpense.length > 0) {
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
        resetCategoryPopover();
      } else {
        setPopoverError('Invalid category name!');
      }
    } else {
      // user didn't enter anything
      resetCategoryPopover();
    }
  }

  function handleExpenseSubmit(e, category) {
    e.preventDefault();
    const userInput = newCategoryOrExpense.trim();

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

    // first check if the category with this name already exists
    if (expenseDuplicates) {
      setPopoverError('Expense already exists!');
    } else if (newCategoryOrExpense.length > 0) {
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
        resetExpensePopover();
      } else {
        setPopoverError('Invalid expense name!');
      }
    } else {
      // user didn't enter anything
      setOpenElementName(false);
    }
  }

  // renaming a category
  function handleCategoryEditSubmit(e, category) {
    e.preventDefault();
    const userInput = nowEditingCategory.trim();

    // potential duplicates
    const categoryDuplicates = budgetData.expenses.find(
      (category) =>
        category.categoryName.toLowerCase() === userInput.toLowerCase()
    );

    // first check if there were any changes to the category name
    if (category === userInput) {
      // no changes, close the popover
      resetCategoryEdit();
    } else {
      // changes were made, check if the new name is valid
      if (nowEditingCategory.length > 0) {
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
            resetCategoryEdit();
          }
        } else {
          //invalid input, throw an error and leave the popover open
          setPopoverError('Invalid category name!');
        }
      } else {
        // user cleared the input - cancel the edit
        resetCategoryEdit();
      }
    }
  }

  // renaming an expense
  function handleExpenseEditSubmit(e, category, expense) {
    e.preventDefault();
    const userInput = nowEditingExpense.trim();

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
      resetExpenseEdit();
    } else {
      // changes were made, check if the new name is valid
      if (nowEditingExpense.length > 0) {
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
            resetExpenseEdit();
          }
        } else {
          // invalid input, throw an error and leave the popover open
          setPopoverError('Invalid expense name!');
        }
      } else {
        // user cleared the input - cancel the edit
        resetExpenseEdit();
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

    setOpenEditCategory(false);
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

    setOpenEditExpense(false);
  }

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
    if (valueOfAmount.length === 0) {
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
        expenseObject.amount !== parseFloat(valueOfAmount) &&
        !isNaN(valueOfAmount)
      ) {
        // apply the changes to the local state
        // copy of the array of the expenses in the category the edited expense belongs to
        let expensesArrayCopy = [...budgetData.expenses];
        expensesArrayCopy[indexOfCategory].expensesInCategory[
          indexOfExpense
        ].amount = parseFloat(valueOfAmount);
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

    setNowEditingAmount(false);
  }

  return loading ? (
    <Loading />
  ) : (
    <div className="bg-gray-100 w-full p-2 flex flex-col max-h-screen">
      <div className="bg-gray-200 flex flex-initial flex-row items-center">
        <div className="ml-20">
          <p>Your budget for</p>
          <div className="font-bold text-xl">
            {MONTHS[currentMonth]} {currentYear}
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
          <p>+0.00€ Funds for {MONTHS[currentMonth]}</p>
          <p>
            -0.00€ Overspent in{' '}
            {MONTHS[currentMonth === 0 ? 10 : currentMonth - 1]}
          </p>
          <p>-0.00€ Budgeted in {MONTHS[currentMonth]}</p>
          <p>-0.00€ Budgeted in Future</p>
        </div>
      </div>

      <div className="overflow-y-auto m-2">
        <Popover
          isOpen={isPopoverOpen}
          positions={['bottom', 'right']}
          onClickOutside={() => resetCategoryPopover()}
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
                    value={newCategoryOrExpense}
                    onChange={(e) => handleCategoryOrExpenseChange(e)}
                  ></input>
                  {popoverError && (
                    <div className="text-sm text-red-500">{popoverError}</div>
                  )}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => resetCategoryPopover()}
                      className="text-blue-500 hover:bg-blue-500 hover:text-white pl-1 pr-1 rounded-md border-2 border-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-400 hover:bg-blue-500 text-white ml-2 pl-4 pr-4 rounded-md border-2 border-gray-300"
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
            className="focus:outline-white inline-block pl-1 pr-1 border-2 border-green-300 bg-gray-100 hover:bg-green-300 rounded-md cursor-pointer"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            + Category
          </button>
        </Popover>
        <div>
          {budgetData.expenses.map((el) => (
            <div className="p-2" key={el.categoryName}>
              <Popover
                isOpen={openEditCategory === el.categoryName}
                positions={['bottom', 'top']}
                onClickOutside={() => resetCategoryEdit()}
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
                          className="border-2 border-blue-400 focus:placeholder-transparent focus:border-blue-300 rounded-sm p-1 focus:ring-10"
                          spellCheck="false"
                          autoComplete="off"
                          maxLength="64"
                          type="text"
                          value={nowEditingCategory}
                          onChange={(e) => handleCategoryEditChange(e)}
                        ></input>
                        {popoverError && (
                          <div className="text-sm text-red-500">
                            {popoverError}
                          </div>
                        )}
                        <div className="pt-2 flex justify-between">
                          <button
                            type="button"
                            onClick={(e) => deleteCategory(e, el.categoryName)}
                            className="text-red-500 hover:bg-red-500 hover:text-white pl-1 pr-1 rounded-md border-2 border-gray-300"
                          >
                            Delete
                          </button>
                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => resetCategoryEdit()}
                              className="text-blue-500 hover:bg-blue-500 hover:text-white pl-1 pr-1 rounded-md border-2 border-gray-300"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="bg-blue-400 hover:bg-blue-500 text-white ml-2 pl-4 pr-4 rounded-md border-2 border-gray-300"
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
                  className="cursor-pointer capitalize font-bold bg-blue-100 hover:bg-blue-300 inline-block border-2 border-blue-300 rounded-md pl-1 pr-1"
                  onClick={() =>
                    openEditCategory === false
                      ? prepareCategoryEdit(el.categoryName)
                      : setOpenEditCategory(false)
                  }
                >
                  {el.categoryName}
                </div>
              </Popover>
              <Popover
                isOpen={openElementName === el.categoryName}
                positions={['right']}
                onClickOutside={() => resetExpensePopover()}
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
                          className="border-2 border-blue-400 focus:placeholder-transparent focus:border-blue-300 rounded-sm p-1 focus:ring-10"
                          spellCheck="false"
                          autoComplete="off"
                          placeholder="New Expense"
                          maxLength="64"
                          type="text"
                          value={newCategoryOrExpense}
                          onChange={(e) => handleCategoryOrExpenseChange(e)}
                        ></input>
                        {popoverError && (
                          <div className="text-sm text-red-500">
                            {popoverError}
                          </div>
                        )}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => resetExpensePopover()}
                            className="text-blue-500 hover:bg-blue-500 hover:text-white pl-1 pr-1 rounded-md border-2 border-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-400 hover:bg-blue-500 text-white ml-2 pl-4 pr-4 rounded-md border-2 border-gray-300"
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
                    className="focus:outline-white border-2 border-green-300 bg-gray-100 hover:bg-green-300 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer ml-1 opacity-50 hover:opacity-100"
                    onClick={() =>
                      openElementName === false
                        ? setOpenElementName(el.categoryName)
                        : setOpenElementName(false)
                    }
                  >
                    +
                  </button>
                </div>
              </Popover>
              {el.expensesInCategory.map((expenseObject) => (
                <div
                  className="border-b-2 hover:bg-blue-100 hover:border-gray-400 pl-2 flex justify-between"
                  key={expenseObject.expense}
                >
                  <div className="cursor-pointer">
                    <Popover
                      isOpen={openEditExpense === expenseObject.expense}
                      positions={['bottom', 'top']}
                      onClickOutside={() => resetExpenseEdit()}
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
                                  el.categoryName,
                                  expenseObject.expense
                                )
                              }
                            >
                              <input
                                className="border-2 border-blue-400 focus:placeholder-transparent focus:border-blue-300 rounded-sm p-1 focus:ring-10"
                                spellCheck="false"
                                autoComplete="off"
                                maxLength="64"
                                type="text"
                                value={nowEditingExpense}
                                onChange={(e) => handleExpenseEditChange(e)}
                              ></input>
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
                                  className="text-red-500 hover:bg-red-500 hover:text-white pl-1 pr-1 rounded-md border-2 border-gray-300"
                                >
                                  Delete
                                </button>
                                <div className="flex">
                                  <button
                                    type="button"
                                    onClick={() => resetExpenseEdit()}
                                    className="text-blue-500 hover:bg-blue-500 hover:text-white pl-1 pr-1 rounded-md border-2 border-gray-300"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    className="bg-blue-400 hover:bg-blue-500 text-white ml-2 pl-4 pr-4 rounded-md border-2 border-gray-300"
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
                        className="hover:bg-blue-100 pl-2 flex justify-between"
                        onClick={() =>
                          openEditExpense === false
                            ? prepareExpenseEdit(expenseObject.expense)
                            : setOpenEditExpense(false)
                        }
                      >
                        {expenseObject.expense}
                      </div>
                    </Popover>
                  </div>
                  <div className="pr-1 pl-1 flex">
                    <form
                      onSubmit={(e) =>
                        handleAmountSubmit(e, el.categoryName, expenseObject)
                      }
                    >
                      <input
                        className="text-right bg-gray-100 cursor-pointer focus:bg-white"
                        key={expenseObject.expense}
                        type="text"
                        onClick={() => prepareAmountEdit(expenseObject)}
                        onChange={(e) => handleAmountEditChange(e)}
                        onBlur={(e) =>
                          handleAmountSubmit(e, el.categoryName, expenseObject)
                        }
                        spellCheck="false"
                        autoComplete="false"
                        value={
                          nowEditingAmount === expenseObject.expense
                            ? valueOfAmount
                            : expenseObject.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                        }
                      ></input>
                    </form>
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
