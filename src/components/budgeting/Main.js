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

// TODO: edge cases with user input (trim, regex,...)

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

  // closes the 'create a category' popup and resets the input value
  function resetCategoryPopover() {
    setIsPopoverOpen(false);
    setnewCategoryOrExpense('');
  }

  // closes the 'create an expense' popup and resets the input value
  function resetExpensePopover() {
    setOpenElementName(false);
    setnewCategoryOrExpense('');
  }

  // closes the 'edit a category' popup and resets the input value
  function resetCategoryEdit() {
    setOpenEditCategory(false);
    setNowEditingCategory('');
  }

  // closes the 'edit an expense' popup and resets the input value
  function resetExpenseEdit() {
    setOpenEditExpense(false);
    setNowEditingExpense('');
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
      setValueOfAmount('');
    } else {
      setValueOfAmount(expenseObject.amount);
    }
  }

  function handleCategoryOrExpenseChange(e) {
    setnewCategoryOrExpense(e.target.value);
  }

  function handleCategoryEditChange(e) {
    setNowEditingCategory(e.target.value);
  }

  function handleExpenseEditChange(e) {
    setNowEditingExpense(e.target.value);
  }

  function handleAmountEditChange(e) {
    setValueOfAmount(e.target.value);
  }

  function handleCategorySubmit(e) {
    // TODO check if the category already exists (comparison to the budgetData)

    e.preventDefault();

    // if user entered a name for the new category
    // add the new custom category to the local state
    if (newCategoryOrExpense.length > 0) {
      setBudgetData((budgetData) => ({
        ...budgetData,
        expenses: [
          ...budgetData.expenses,
          {
            categoryName: newCategoryOrExpense,
            expensesInCategory: [],
          },
        ],
      }));

      // reset the category popover
      resetCategoryPopover();

      // update user's categories in the recurring document
      docRefRecurringData.update({
        expenses: firebase.firestore.FieldValue.arrayUnion({
          categoryName: newCategoryOrExpense,
          expensesInCategory: [],
        }),
      });

      // update user's categories in the user's current month document
      docRefCurrentMonth.update({
        expenses: firebase.firestore.FieldValue.arrayUnion({
          categoryName: newCategoryOrExpense,
          expensesInCategory: [],
        }),
      });
    } else {
      // user didn't enter anything
      setIsPopoverOpen(false);
    }
  }

  function handleExpenseSubmit(e, category) {
    // TODO check if the expense already exists in this category (lahko lokalno)

    e.preventDefault();

    // if user entered a name for the new expense
    // add the new expense to the local state
    if (newCategoryOrExpense.length > 0) {
      // find the index of the category that we want to add an expense to
      const elementsIndex = budgetData.expenses.findIndex(
        (element) => element.categoryName === category
      );

      // create a copy of the expenses array
      // and update the copy with the new expense
      let newArrayOfExpenses = [...budgetData.expenses];
      newArrayOfExpenses[elementsIndex].expensesInCategory.push({
        expense: newCategoryOrExpense,
        amount: 0,
      });

      // add the expense to the local state
      setBudgetData((budgetData) => ({
        ...budgetData,
        expenses: newArrayOfExpenses,
      }));

      // reset the expense popover
      resetExpensePopover();

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
    } else {
      // user didn't enter anything
      setOpenElementName(false);
    }
  }

  // renaming a category
  function handleCategoryEditSubmit(e, category) {
    e.preventDefault();

    // check if user made any changes to the category name
    // and only apply changes if the user didn't leave the field empty
    if (
      category !== nowEditingCategory &&
      nowEditingCategory.length >
        0 /* TODO && 'truthy' user's input && category doesn't exist yet*/
    ) {
      // find the index of the category that we want to edit the name of
      const elementsIndex = budgetData.expenses.findIndex(
        (element) => element.categoryName === category
      );

      // create a copy of the expenses array
      // find the correct category and rename it
      let expensesArrayCopy = [...budgetData.expenses];
      expensesArrayCopy[elementsIndex].categoryName = nowEditingCategory;

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
    }
    setOpenEditCategory(false);
  }

  // renaming an expense
  function handleExpenseEditSubmit(e, category, expense) {
    e.preventDefault();

    // check if user made any changes to the category name
    // and only apply changes if the user didn't leave the field empty
    if (
      expense !== nowEditingExpense &&
      nowEditingExpense.length >
        0 /* TODO && 'truthy' user's input && category doesn't exist yet*/
    ) {
      // the index of the category that the edited expense belongs to
      const indexOfCategory = budgetData.expenses.findIndex(
        (element) => element.categoryName === category
      );

      // the index of the expense inside the category at that index
      const indexOfExpense = budgetData.expenses[
        indexOfCategory
      ].expensesInCategory.findIndex((element) => element.expense === expense);

      // apply the changes to the local state
      // copy of the array of the expenses in the category the edited expense belongs to
      let expensesArrayCopy = [...budgetData.expenses];
      expensesArrayCopy[indexOfCategory].expensesInCategory[
        indexOfExpense
      ].expense = nowEditingExpense;
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
    }
    setOpenEditExpense(false);
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
    // category pass refactor
    e.preventDefault();

    // the index of the category that the edited expense belongs to
    const indexOfCategory = budgetData.expenses.findIndex(
      (element) => element.categoryName === category // SAMO BREZ .CATEGORY NAME
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
      if (expenseObject.amount !== parseFloat(valueOfAmount)) {
        // check if the user entered a number
        if (isNaN(valueOfAmount) === true) {
          setNowEditingAmount(false);
        } else {
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

          setNowEditingAmount(false);
          // TODO recurring
        }
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
                  className="capitalize border-b-2 hover:bg-blue-100 hover:border-gray-400 pl-2 flex justify-between"
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
                                placeholder="New Category"
                                maxLength="64"
                                type="text"
                                value={nowEditingExpense}
                                onChange={(e) => handleExpenseEditChange(e)}
                              ></input>
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
                        className="capitalize hover:bg-blue-100 pl-2 flex justify-between"
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
