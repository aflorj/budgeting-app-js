import React from 'react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChartPieIcon,
} from '@heroicons/react/outline';
import { Trans } from 'react-i18next';

export default function LoadingData() {
  return (
    <div className="font-body bg-gray-100 dark:bg-gray-700 p-2 flex flex-col mt-4 mb-8 mx-0 lg:mx-12 xl:mx-20 rounded-lg shadow-xl min-h-full">
      {/* budgetInfo */}
      <div className="bg-green-100 flex flex-row items-center rounded-lg shadow-lg m-2">
        <div className="ml-4 md:ml-8 lg:ml-20 flex items-center">
          <ChevronLeftIcon className="h-8 w-8 cursor-pointer transform transition hover:scale-125 opacity-50 hover:opacity-100" />
          <div className="flex-col">
            <div className="hidden lg:block">
              <Trans>Your budget for</Trans>
            </div>
            <div className="flex justify-center">
              <p className="flex flex-col justify-center lg:flex-row lg:space-x-1">
                <div className="h-7 w-14 bg-gradient-to-r from-green-300 to-transparent rounded-l"></div>
                <div className="h-7 w-12 bg-gradient-to-r from-green-300 to-transparent rounded-l"></div>
              </p>
            </div>
          </div>
          <ChevronRightIcon className="h-8 w-8 cursor-pointer transform transition hover:scale-125 opacity-50 hover:opacity-100" />
        </div>
        <div className="flex flex-col text-white p-5 ml-4 md:ml-20 lg:ml-40 bg-green-400 dark:bg-green-500 rounded-md">
          <div className="font-extrabold">
            <div className="h-6 w-14 bg-gradient-to-r from-green-300 to-transparent rounded-l"></div>
          </div>
          <p>
            <Trans>to be budgeted</Trans>
          </p>
        </div>
        <div className="flex flex-col text-sm ml-2 space-y-1">
          <p className="h-4	w-28 bg-gradient-to-r from-green-300 to-transparent rounded-l"></p>
          <p className="h-4	w-36 bg-gradient-to-r from-green-300 to-transparent rounded-l"></p>
          <p className="h-4	w-32 bg-gradient-to-r from-green-300 to-transparent rounded-l"></p>
          <p className="h-4	w-24 bg-gradient-to-r from-green-300 to-transparent rounded-l"></p>
        </div>
      </div>
      {/* budgetInfo */}
      <div className="flex flex-col lg:flex-row dark:text-gray-100">
        <div className="overflow-y-auto m-2 flex-col space-y-2 w-full lg:w-1/2">
          {/* INFLOWS */}
          <div id="all-inflows-wrapper" className="flex flex-col">
            <div className="flex items-center">
              <p className="text-xl font-bold underline dark:text-gray-200">
                <Trans>Inflows</Trans>
              </p>
              {/* add in inflow popover - start */}

              <div className="inline-block">
                <button className="focus:outline-white border-2 border-green-300 dark:border-gray-100 bg-gray-100 dark:bg-blue-300 hover:bg-green-300 dark:hover:bg-blue-400 rounded-full h-5 w-5 flex items-center justify-center cursor-pointer ml-1 opacity-75 hover:opacity-100 transform transition hover:scale-125 dark:text-black">
                  +
                </button>
              </div>

              {/* add an inflow popover - end */}
            </div>
            <div>
              <div className="flex space-x-2">
                <div>
                  <div className="cursor-pointer">
                    {/* edit an inflow popover - start */}

                    <div className="pl-2 h-6 w-16 bg-gradient-to-r from-green-300 to-transparent rounded-l"></div>

                    {/* edit an inflow popover - end  */}
                  </div>
                </div>
                <div className="px-1">
                  <div className="pl-2 h-6 w-14 bg-gradient-to-r from-green-300 to-transparent rounded-l"></div>
                </div>
              </div>
            </div>
          </div>
          {/* INFLOWS */}
          {/* CATEGORIES */}
          <div id="all-expenses-wrapper" className="">
            <div id="little-wrapper" className="flex space-x-1 items-end">
              <p className="text-xl font-bold underline">
                <Trans>Expenses</Trans>
              </p>
              {/* adding a category popover - start */}
              <button className="focus:outline-white inline-block px-1 border-2 border-green-300 dark:border-gray-100 bg-gray-100 dark:bg-blue-300 hover:bg-green-300 dark:hover:bg-blue-400 rounded-md cursor-pointer text-sm dark:text-black">
                <Trans>+ Category</Trans>
              </button>
              {/* adding a category popover - end */}
            </div>
            {/* TODO insert the legend here */}
            <div id="all-expenses-in-category-and-category-wrapper">
              <div className="p-2 rounded-lg shadow-lg my-2 border-l-8 border-green-200 dark:border-green-300 mr-4 dark:bg-gray-600">
                {/* editing a category popover - start */}

                <div className="h-6 w-24 bg-gradient-to-r from-green-300 to-transparent rounded-l inline-block rounded-md px-1"></div>

                {/* editing a category popover - end */}
                {/* adding an expense popover - start */}

                <div className="inline-block">
                  <button className="focus:outline-white border-2 border-green-300 dark:border-gray-100 bg-gray-100 dark:bg-blue-300 hover:bg-green-300  dark:hover:bg-blue-400  rounded-full h-5 w-5 flex items-center justify-center cursor-pointer ml-1 opacity-75 hover:opacity-100 transform transition hover:scale-125 dark:text-black">
                    +
                  </button>
                </div>

                {/* adding an expense popover - end */}

                {/* EXPENSES */}
                {['14', '16', '11', '24', '36', '28'].map((w) => (
                  <div
                    // border before hover is the same color as background
                    className="border-b-2 border-gray-100 dark:border-gray-600 pl-2 flex justify-between"
                  >
                    {/* ta objame expense in prvi input */}
                    <div className="flex justify-between w-4/5">
                      <div className="flex justify-between w-7/12">
                        <div className="cursor-pointer">
                          {/* editing an expense - start */}

                          <div
                            className={`pl-2 flex h-6 w-${w} bg-gradient-to-r from-green-300 to-transparent rounded-l`}
                          ></div>

                          {/* editing an expense - end */}
                        </div>
                        <div className="w-1/3 text-sm"></div>
                      </div>
                      <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                      {/* do tu objamemo prvi input */}
                    </div>
                    {/* do tu objamemo prvi input */}
                    {/* EXLIMIT */}
                    <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                    {/* EXLIMIT */}
                  </div>
                ))}

                {/* EXPENSES */}

                <div className="flex justify-between border-t-2 pl-2 bg-green-100 dark:bg-green-300 rounded-lg dark:text-gray-900">
                  <div className="flex justify-between w-4/5">
                    <div className="flex justify-between w-7/12">
                      <div className="pl-2"></div>
                      <div className="w-1/3 text-sm"></div>
                    </div>
                    <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                  </div>
                  {/* CLIMIT */}
                  <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                  {/* CLIMIT */}
                </div>
              </div>
            </div>

            <div id="all-expenses-in-category-and-category-wrapper">
              <div className="p-2 rounded-lg shadow-lg my-2 border-l-8 border-green-200 dark:border-green-300 mr-4 dark:bg-gray-600">
                {/* editing a category popover - start */}

                <div className="h-6 w-24 bg-gradient-to-r from-green-300 to-transparent rounded-l inline-block rounded-md px-1"></div>

                {/* editing a category popover - end */}
                {/* adding an expense popover - start */}

                <div className="inline-block">
                  <button className="focus:outline-white border-2 border-green-300 dark:border-gray-100 bg-gray-100 dark:bg-blue-300 hover:bg-green-300  dark:hover:bg-blue-400  rounded-full h-5 w-5 flex items-center justify-center cursor-pointer ml-1 opacity-75 hover:opacity-100 transform transition hover:scale-125 dark:text-black">
                    +
                  </button>
                </div>

                {/* adding an expense popover - end */}

                {/* EXPENSES */}
                {['14', '16', '11', '24', '36', '28'].map((w) => (
                  <div
                    // border before hover is the same color as background
                    className="border-b-2 border-gray-100 dark:border-gray-600 pl-2 flex justify-between"
                  >
                    {/* ta objame expense in prvi input */}
                    <div className="flex justify-between w-4/5">
                      <div className="flex justify-between w-7/12">
                        <div className="cursor-pointer">
                          {/* editing an expense - start */}

                          <div
                            className={`pl-2 flex h-6 w-${w} bg-gradient-to-r from-green-300 to-transparent rounded-l`}
                          ></div>

                          {/* editing an expense - end */}
                        </div>
                        <div className="w-1/3 text-sm"></div>
                      </div>
                      <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                      {/* do tu objamemo prvi input */}
                    </div>
                    {/* do tu objamemo prvi input */}
                    {/* EXLIMIT */}
                    <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                    {/* EXLIMIT */}
                  </div>
                ))}

                {/* EXPENSES */}

                <div className="flex justify-between border-t-2 pl-2 bg-green-100 dark:bg-green-300 rounded-lg dark:text-gray-900">
                  <div className="flex justify-between w-4/5">
                    <div className="flex justify-between w-7/12">
                      <div className="pl-2"></div>
                      <div className="w-1/3 text-sm"></div>
                    </div>
                    <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                  </div>
                  {/* CLIMIT */}
                  <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                  {/* CLIMIT */}
                </div>
              </div>
            </div>

            <div id="all-expenses-in-category-and-category-wrapper">
              <div className="p-2 rounded-lg shadow-lg my-2 border-l-8 border-green-200 dark:border-green-300 mr-4 dark:bg-gray-600">
                {/* editing a category popover - start */}

                <div className="h-6 w-24 bg-gradient-to-r from-green-300 to-transparent rounded-l inline-block rounded-md px-1"></div>

                {/* editing a category popover - end */}
                {/* adding an expense popover - start */}

                <div className="inline-block">
                  <button className="border-2 border-green-300 dark:border-gray-100 bg-gray-100 dark:bg-blue-300 rounded-full h-5 w-5 flex items-center justify-center ml-1 opacity-75 dark:text-black">
                    +
                  </button>
                </div>

                {/* adding an expense popover - end */}

                {/* EXPENSES */}
                {['14', '16', '11', '24', '36', '28'].map((w) => (
                  <div
                    // border before hover is the same color as background
                    className="border-b-2 border-gray-100 dark:border-gray-600 pl-2 flex justify-between"
                  >
                    {/* ta objame expense in prvi input */}
                    <div className="flex justify-between w-4/5">
                      <div className="flex justify-between w-7/12">
                        <div className="cursor-pointer">
                          {/* editing an expense - start */}

                          <div
                            className={`pl-2 flex h-6 w-${w} bg-gradient-to-r from-green-300 to-transparent rounded-l`}
                          ></div>

                          {/* editing an expense - end */}
                        </div>
                        <div className="w-1/3 text-sm"></div>
                      </div>
                      <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                      {/* do tu objamemo prvi input */}
                    </div>
                    {/* do tu objamemo prvi input */}
                    {/* EXLIMIT */}
                    <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                    {/* EXLIMIT */}
                  </div>
                ))}

                {/* EXPENSES */}

                <div className="flex justify-between border-t-2 pl-2 bg-green-100 dark:bg-green-300 rounded-lg dark:text-gray-900">
                  <div className="flex justify-between w-4/5">
                    <div className="flex justify-between w-7/12">
                      <div className="pl-2"></div>
                      <div className="w-1/3 text-sm"></div>
                    </div>
                    <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                  </div>
                  {/* CLIMIT */}
                  <div className="bg-gradient-to-r from-green-300 to-transparent rounded-l h-6 w-16"></div>
                  {/* CLIMIT */}
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORIES */}
        </div>
        <div className="w-full lg:w-1/2 m-2">
          {/* CHARTS */}
          <div
            id="charts-wrapper"
            className="flex flex-col md:flex-row lg:flex-col"
          >
            <div className="w-auto md:w-1/2 lg:w-full">
              <div className="flex justify-center items-end pt-8">
                <ChartPieIcon className="w-6 h-6" />
                <p className="italic text-gray-600 dark:text-gray-200">
                  <Trans>
                    You must enter at least two expenses to display the
                  </Trans>
                  <span className="text-black dark:text-gray-400">
                    <Trans> Expenses chart</Trans>
                  </span>
                  .
                </p>
              </div>
            </div>
            <div className="w-auto md:w-1/2 lg:w-full">
              <div className="flex justify-center items-end pt-8">
                <ChartPieIcon className="w-6 h-6" />
                <p className="italic text-gray-600 dark:text-gray-200">
                  <Trans>
                    You must enter expenses in at least two categories to
                    display the
                  </Trans>
                  <span className="text-black dark:text-gray-400">
                    <Trans> Categories chart</Trans>
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
          {/* CHARTS */}
        </div>
      </div>
    </div>
  );
}
