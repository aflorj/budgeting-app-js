import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase';
import { DEFAULT_CATEGORIES } from '../../constants';
import Loading from './Loading';
import Charts from './Charts';
import BudgetInfo from './BudgetInfo';
import Inflows from './Inflows';
import Categories from './Categories';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  displayedBudgetAtom,
  budgetDataAtom,
  loadingAtom,
  openPopoverAtom,
} from '../../utils/atoms';

// TODO dealing with recurring expense, adding saving/purchase goals
// TODO refactor: create a function that adds toLocaleString + currency

export default function Main({ user }) {
  // renders the Loading component while the data is being fetched
  const [loading, setLoading] = useRecoilState(loadingAtom);

  // all budgeting data
  const [budgetData, setBudgetData] = useRecoilState(budgetDataAtom);

  // month/year of the currently displayed budget
  const displayedBudget = useRecoilValue(displayedBudgetAtom);

  // popover state shared between all popovers
  // false or the name of the currently open popover
  const openPopover = useRecoilValue(openPopoverAtom);

  // focus ref
  const inputElement = useRef(null);

  // focus the popover input field when it's open
  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, [openPopover]);

  useEffect(() => {
    budgetData.inflows &&
      docRefCurrentMonth.set(
        {
          inflows: budgetData.inflows,
        },
        { merge: true }
      );
  }, [budgetData.inflows]);

  useEffect(() => {
    budgetData.expenses &&
      docRefCurrentMonth.set(
        {
          expenses: budgetData.expenses,
        },
        { merge: true }
      );
  }, [budgetData.expenses]);

  // firestore documents references
  const dbRefUser = db.collection('usersdb').doc(user.uid);
  const docRefRecurringData = dbRefUser
    .collection('recurringData')
    .doc('recurringData');
  const docRefCurrentMonth = dbRefUser
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
                    //docRefCurrentMonth.set(doc.data()); eeee
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

          // set local state to a default default preset
          setBudgetData({
            expenses: DEFAULT_CATEGORIES,
            inflows: [],
          });

          // Render
          setLoading(false);

          // TODO shepherdjs stuff

          // create a new document for that user
          dbRefUser.set({});

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
          // user is switching to a budget that exists

          // set local state with the data from the fetch month document
          setBudgetData(doc.data());
        } else {
          // user is creating a new budget document for the month

          // create a new document for that month, based on the user's recurring document
          docRefRecurringData
            .get()
            .then((doc) => {
              // local budget state set to the user's recurring doc data
              setBudgetData(doc.data());
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

  return loading ? (
    <Loading />
  ) : (
    <div className="bg-gray-100 p-2 flex flex-col mt-4 mb-8 mx-8 rounded-lg shadow-lg min-h-full">
      <BudgetInfo />
      <div className="flex flex-row">
        <div className="overflow-y-auto m-2 flex-col space-y-2 w-1/2">
          <Inflows user={user} inputElement={inputElement} />
          <Categories user={user} inputElement={inputElement} />
        </div>
        <div className="w-1/2 m-2">
          <Charts expenses={budgetData.expenses} />
        </div>
      </div>
    </div>
  );
}
