import React from 'react';
import { cloneDeep } from 'lodash';
import firebase from 'firebase/app';
import { Line } from 'rc-progress';
import Expense from './Expense';
import { Popover, ArrowContainer } from 'react-tiny-popover';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  budgetDataAtom,
  openPopoverAtom,
  userInputValueAtom,
  popoverErrorAtom,
  preferencesAtom,
} from '../../utils/atoms';
import CategoryLimit from './CategoryLimit';

export default function Categories({
  inputElement,
  helpers,
  docRefRecurringData,
}) {
  const userInputValue = useRecoilValue(userInputValueAtom);
  const [budgetData, setBudgetData] = useRecoilState(budgetDataAtom);
  const [popoverError, setPopoverError] = useRecoilState(popoverErrorAtom);
  const [openPopover, setOpenPopover] = useRecoilState(openPopoverAtom);
  const preferences = useRecoilValue(preferencesAtom);

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
              categoryLimitAmount: 0,
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

        // reset the category popover
        helpers.resetPopover();
      } else {
        setPopoverError('Invalid category name!');
      }
    } else {
      // user didn't enter anything
      helpers.resetPopover();
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
      helpers.resetPopover();
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
            // find the correct category and rename it in the atom
            let expensesArrayCopy = cloneDeep(budgetData.expenses);
            expensesArrayCopy[elementsIndex].categoryName = userInput;

            setBudgetData((budgetData) => ({
              ...budgetData,
              expenses: expensesArrayCopy,
            }));

            // reset the category popover
            helpers.resetPopover();
          }
        } else {
          //invalid input, display an error and leave the popover open
          setPopoverError('Invalid category name!');
        }
      } else {
        // user cleared the input - cancel the edit
        helpers.resetPopover();
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

    // delete the category from the atom
    let expensesArrayCopy = cloneDeep(budgetData.expenses);
    expensesArrayCopy.splice(indexToRemove, 1);
    setBudgetData((budgetData) => ({
      ...budgetData,
      expenses: expensesArrayCopy,
    }));

    // delete the category from the db
    // firestore "arrayRemove" requires an exact copy of the object being removed
    // our data is normalized so we can find the exact object in our atom
    const objectToRemove = budgetData.expenses[indexToRemove];

    // 'recurring' document
    docRefRecurringData.update({
      expenses: firebase.firestore.FieldValue.arrayRemove(objectToRemove),
    });

    helpers.resetPopover();
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
        let newArrayOfExpenses = cloneDeep(budgetData.expenses);
        newArrayOfExpenses[elementsIndex].expensesInCategory.push({
          expense: userInput,
          amount: 0,
          limitAmount: 0,
        });

        // add the expense to the atom
        setBudgetData((budgetData) => ({
          ...budgetData,
          expenses: newArrayOfExpenses,
        }));

        // reset the expense popover
        helpers.resetPopover();
      } else {
        setPopoverError('Invalid expense name!');
      }
    } else {
      // user didn't enter anything
      helpers.resetPopover();
    }
  }

  function calculateCategoryTotal(expenses) {
    let categoryTotal = 0;
    expenses.forEach((expense) => {
      categoryTotal += expense.amount;
    });
    return categoryTotal;
  }

  return (
    <div id="all-expenses-wrapper" className="">
      <div id="little-wrapper" className="flex space-x-1 items-end">
        <p className="text-xl font-bold underline">Expenses</p>
        {/* adding a category popover - start */}
        <Popover
          isOpen={openPopover === 'addCategory'}
          positions={['bottom', 'right']}
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
                    onChange={(e) => helpers.handleInputChange(e)}
                  />
                  {popoverError && (
                    <div className="text-sm text-red-500">{popoverError}</div>
                  )}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => helpers.resetPopover()}
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
      {/* TODO insert the legend here */}
      <div id="all-expenses-in-category-and-category-wrapper">
        {budgetData.expenses.length ? (
          budgetData.expenses.map((el) => (
            <div
              className="p-2 rounded-lg shadow-lg my-2 border-l-8 border-green-200"
              id="each-category-wrapped"
              key={el.categoryName}
            >
              {/* editing a category popover - start */}
              <Popover
                isOpen={openPopover === 'category_' + el.categoryName}
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
                          onChange={(e) => helpers.handleInputChange(e)}
                        />
                        {popoverError && (
                          <div className="text-sm text-red-500">
                            {popoverError}
                          </div>
                        )}
                        <div className="pt-2 flex justify-between">
                          <button
                            type="button"
                            onClick={(e) => deleteCategory(e, el.categoryName)}
                            className="text-red-500 hover:bg-red-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                          >
                            Delete
                          </button>
                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => helpers.resetPopover()}
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
                      ? helpers.resetPopover()
                      : helpers.prepareEdit('category_', el.categoryName)
                  }
                >
                  {el.categoryName}
                </div>
              </Popover>
              {/* editing a category popover - end */}
              {/* adding an expense popover - start */}
              <Popover
                isOpen={openPopover === 'addExpense_' + el.categoryName}
                positions={['right']}
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
                          onChange={(e) => helpers.handleInputChange(e)}
                        />
                        {popoverError && (
                          <div className="text-sm text-red-500">
                            {popoverError}
                          </div>
                        )}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => helpers.resetPopover()}
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
                        ? helpers.resetPopover()
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
                  <Expense
                    expenseObject={expenseObject}
                    categoryName={el.categoryName}
                    inputElement={inputElement}
                    helpers={helpers}
                  />
                ))
              ) : (
                <div>
                  <p className="pl-2 italic text-gray-700">
                    No expenses in this category.
                  </p>
                </div>
              )}
              {el.expensesInCategory.length > 0 && (
                <div className="flex justify-between border-t-2 pl-2 bg-green-100 rounded-lg">
                  <div className="flex justify-between w-4/5">
                    <div className="flex justify-between w-7/12">
                      <div className="pl-2"></div>
                      <div className="w-1/3 text-sm">
                        {el.categoryLimitAmount > 0 &&
                          calculateCategoryTotal(el.expensesInCategory) > 0 &&
                          calculateCategoryTotal(el.expensesInCategory) <=
                            el.categoryLimitAmount && (
                            <div className="items-center flex space-x-2">
                              <Line
                                percent={helpers.calculatePercentage(
                                  calculateCategoryTotal(el.expensesInCategory),
                                  el.categoryLimitAmount
                                )}
                                strokeWidth="10"
                                trailWidth="10"
                                strokeColor={
                                  helpers.calculatePercentage(
                                    calculateCategoryTotal(
                                      el.expensesInCategory
                                    ),
                                    el.categoryLimitAmount
                                  ) < 70
                                    ? '#34d399'
                                    : helpers.calculatePercentage(
                                        calculateCategoryTotal(
                                          el.expensesInCategory
                                        ),
                                        el.categoryLimitAmount
                                      ) < 90
                                    ? '#FFA500'
                                    : '#FF0000'
                                }
                              />
                              <div>
                                {helpers.calculatePercentage(
                                  calculateCategoryTotal(el.expensesInCategory),
                                  el.categoryLimitAmount
                                ) + '%'}
                              </div>
                            </div>
                          )}
                        {el.categoryLimitAmount > 0 &&
                          calculateCategoryTotal(el.expensesInCategory) > 0 &&
                          calculateCategoryTotal(el.expensesInCategory) >
                            el.categoryLimitAmount && (
                            <div className="text-red-500 text-base font-bold">
                              {'-'}
                              {(
                                calculateCategoryTotal(el.expensesInCategory) -
                                el.categoryLimitAmount
                              ).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                              {preferences.displaySymbol &&
                                preferences.currency}
                            </div>
                          )}
                      </div>
                    </div>
                    <div>
                      {calculateCategoryTotal(
                        el.expensesInCategory
                      ).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {preferences.displaySymbol && preferences.currency}
                    </div>
                  </div>
                  <CategoryLimit category={el} helpers={helpers} />
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
  );
}
