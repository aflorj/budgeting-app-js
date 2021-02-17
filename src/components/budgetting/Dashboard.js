import React, { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import { db } from "../../firebase";
const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth();
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  let totalToBudget = 0;
  const currency = "€";
  const docRef = db
    .collection("usersdb")
    .doc(currentUser.uid)
    .collection("budgetsByMonth")
    .doc(`${currentYear}_${currentMonth}`);

  useEffect(() => {
    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          // Not a first ever (or first time this month) login from this user
          // Get data from the document and populate the app
          console.log(doc.data());
          totalToBudget = doc.data().budget;
        } else {
          // First ever (or first time this month) login from this user
          // Create a new document for this month
          docRef.set({
            budget: 0,
          });
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }, []);

  async function handleLogout() {
    await logout();
    history.push("/login");
  }

  return (
    <>
      <div>
        <div>
          Your budget for {months[currentMonth]} {currentYear}
        </div>
        <div>
          Total to budget: {totalToBudget.toFixed(2)} {currency}
        </div>
        <div>Email: {currentUser.email}</div>
      </div>
      <div>
        <Link to="/profile">Update Profile</Link>
      </div>
      <button onClick={handleLogout}>Log Out</button>
    </>
  );
}
