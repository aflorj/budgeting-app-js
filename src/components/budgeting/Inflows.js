import React from 'react';
import { cloneDeep } from 'lodash';
import firebase from 'firebase/app';
import { Popover, ArrowContainer } from 'react-tiny-popover';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  budgetDataAtom,
  openPopoverAtom,
  userInputValueAtom,
  popoverErrorAtom,
  userAmountValueAtom,
  preferencesAtom,
} from '../../utils/atoms';
import { Trans, useTranslation } from 'react-i18next';

export default function Inflows({
  inputElement,
  helpers,
  docRefRecurringData,
}) {
  const { t } = useTranslation();
  const userInputValue = useRecoilValue(userInputValueAtom);
  const [budgetData, setBudgetData] = useRecoilState(budgetDataAtom);
  const [popoverError, setPopoverError] = useRecoilState(popoverErrorAtom);
  const [openPopover, setOpenPopover] = useRecoilState(openPopoverAtom);
  const userAmountValue = useRecoilValue(userAmountValueAtom);
  const preferences = useRecoilValue(preferencesAtom);

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
        // reset the inflow popover
        helpers.resetPopover();
      } else {
        setPopoverError('Invalid inflow name!');
      }
    } else {
      // user didn't enter anything
      helpers.resetPopover();
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
      helpers.resetPopover();
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
            let inflowsArrayCopy = cloneDeep(budgetData.inflows);
            inflowsArrayCopy[inflowsIndex].inflowName = userInput;

            setBudgetData((budgetData) => ({
              ...budgetData,
              inflows: inflowsArrayCopy,
            }));

            // reset the inflows popover
            helpers.resetPopover();
          }
        } else {
          // invalid input, throw an error and leave the popover open
          setPopoverError('Invalid inflow name!');
        }
      } else {
        // user cleared the input - cancel the edit
        helpers.resetPopover();
      }
    }
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
    let inflowsArrayCopy = cloneDeep(budgetData.inflows);
    inflowsArrayCopy.splice(indexToRemove, 1);
    setBudgetData((budgetData) => ({
      ...budgetData,
      inflows: inflowsArrayCopy,
    }));

    // delete the inflow from the db
    const objectToRemove = budgetData.inflows[indexToRemove];

    // 'recurring' document
    docRefRecurringData.update({
      inflows: firebase.firestore.FieldValue.arrayRemove(objectToRemove),
    });

    helpers.resetPopover();
  }

  // changing the amount of an inflow
  function handleInflowAmountSubmit(e, inflow) {
    e.preventDefault();

    // the index of the inflow and a copy of the inflows array
    const indexOfInflow = budgetData.inflows.findIndex(
      (element) => element.inflowName === inflow.inflowName
    );
    let inflowsArrayCopy = cloneDeep(budgetData.inflows);

    // clearing the input and submitting equals to setting the inflow amount to zero
    if (userAmountValue.length === 0) {
      inflowsArrayCopy[indexOfInflow].amount = 0;

      // set it to zero in the atom
      setBudgetData((budgetData) => ({
        ...budgetData,
        inflows: inflowsArrayCopy,
      }));
    } else {
      // the user has changed the amount of this inflow and did not leave the input field empty
      // and the value of the input was a number
      if (
        inflow.amount !== parseFloat(userAmountValue) &&
        !isNaN(userAmountValue) &&
        parseFloat(userAmountValue) >= 0
      ) {
        // apply the changes to the atom
        inflowsArrayCopy[indexOfInflow].amount = parseFloat(userAmountValue);
        setBudgetData((budgetData) => ({
          ...budgetData,
          inflows: inflowsArrayCopy,
        }));
      }
    }

    setOpenPopover(false);
  }

  return (
    <div id="all-inflows-wrapper" className="flex flex-col">
      <div className="flex items-center">
        <p className="text-xl font-bold underline dark:text-gray-200">
          <Trans>Inflows</Trans>
        </p>
        {/* add in inflow popover - start */}
        <Popover
          isOpen={openPopover === 'inflow'}
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
                <form onSubmit={(e) => handleInflowSubmit(e)}>
                  <input
                    className="border-2 border-blue-400 focus:border-blue-300 rounded-sm py-1 px-2 focus:ring-10"
                    spellCheck="false"
                    autoComplete="off"
                    placeholder={t('New Inflow')}
                    maxLength="64"
                    type="text"
                    ref={inputElement}
                    value={userInputValue}
                    onChange={(e) => helpers.handleInputChange(e)}
                  />
                  {popoverError && (
                    <div className="text-sm text-red-500">
                      <Trans>{popoverError}</Trans>
                    </div>
                  )}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => helpers.resetPopover()}
                      className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                    >
                      <Trans>Cancel</Trans>
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                    >
                      <Trans>OK</Trans>
                    </button>
                  </div>
                </form>
              </div>
            </ArrowContainer>
          )}
        >
          <div className="inline-block">
            <button
              className="focus:outline-white border-2 border-green-300 dark:border-gray-100 bg-gray-100 dark:bg-blue-300 hover:bg-green-300 dark:hover:bg-blue-400 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer ml-1 opacity-75 hover:opacity-100 transform transition hover:scale-125 dark:text-black"
              onClick={() =>
                openPopover === 'inflow'
                  ? helpers.resetPopover()
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
                              handleInflowEditSubmit(e, inflow.inflowName)
                            }
                          >
                            <input
                              className="border-2 border-blue-400 focus:border-blue-300 rounded-sm py-1 px-2 focus:ring-10"
                              spellCheck="false"
                              autoComplete="off"
                              maxLength="64"
                              type="text"
                              placeholder={t('New name for this inflow')}
                              ref={inputElement}
                              value={userInputValue}
                              onChange={(e) => helpers.handleInputChange(e)}
                            />
                            {popoverError && (
                              <div className="text-sm text-red-500">
                                <Trans>{popoverError}</Trans>
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
                                <Trans>Delete</Trans>
                              </button>
                              <div className="flex">
                                <button
                                  type="button"
                                  onClick={() => helpers.resetPopover()}
                                  className="text-blue-500 hover:bg-blue-500 hover:text-white px-1 rounded-md border-2 border-gray-300"
                                >
                                  <Trans>Cancel</Trans>
                                </button>
                                <button
                                  type="submit"
                                  className="bg-blue-400 hover:bg-blue-500 text-white ml-2 px-4 rounded-md border-2 border-gray-300"
                                >
                                  <Trans>OK</Trans>
                                </button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </ArrowContainer>
                    )}
                  >
                    <div
                      className="pl-2 flex hover:text-gray-600 dark:hover:text-gray-400"
                      onClick={() =>
                        openPopover === 'inflow_' + inflow.inflowName
                          ? helpers.resetPopover()
                          : helpers.prepareEdit('inflow_', inflow.inflowName)
                      }
                    >
                      {inflow.inflowName}
                    </div>
                  </Popover>
                  {/* edit an inflow popover - end  */}
                </div>
              </div>
              <div className="px-1 flex">
                <form onSubmit={(e) => handleInflowAmountSubmit(e, inflow)}>
                  <input
                    className="text-right bg-gray-100 dark:bg-gray-700 cursor-pointer focus:bg-white hover:text-gray-600 dark:hover:text-gray-400"
                    id="inflow-amount"
                    key={inflow.inflowName}
                    size="10"
                    type="text"
                    onClick={() =>
                      helpers.prepareAmountEdit(
                        'inflowAmount',
                        inflow.inflowName,
                        inflow.amount
                      )
                    }
                    onChange={(e) => helpers.handleAmountChange(e)}
                    onBlur={(e) => handleInflowAmountSubmit(e, inflow)}
                    spellCheck="false"
                    autoComplete="off"
                    value={
                      openPopover === 'inflowAmount_' + inflow.inflowName
                        ? userAmountValue
                        : inflow.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                    }
                  />
                </form>
                {preferences.displaySymbol && preferences.currency}
              </div>
            </div>
          ))
        ) : (
          <div className="pl-2 italic text-gray-700 dark:text-gray-200">
            <Trans>No inflows.</Trans>
          </div>
        )}
      </div>
    </div>
  );
}
