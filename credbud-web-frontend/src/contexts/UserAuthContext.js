import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { auth } from "firebase.js";
import { login, fetchUserData } from "../api/apiService.js"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
const apiKey = process.env.REACT_APP_BACKEND_URL;
const userContext = createContext();
export function UserAuthContextProvider({ children }) {
  // const [user, setUser] = useState();
  const [uid, setUid] = useState(null);
  const [searchedProfile, setSearchedProfile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  async function sendResetLink(mail) {
    sendPasswordResetEmail(auth, mail)
      .then(function () {
        alert("SENT");
      })
      .catch(function (error) {
        alert(error);
        // An error happened.
      });
  }

  async function getUserProfile() {
    const cachedUser = JSON.parse(localStorage.getItem('userProfile'));
    if (cachedUser) {
      // console.log(cachedUser)
      return (cachedUser.data)
    } else {
      const uid = Cookies.get('uid');
      if (uid) {
        fetchUserData(uid).then((data) => {

          localStorage.setItem('userProfile', JSON.stringify(data));
          return (data)
        });
      }
      else {
        logOut()
      }

    }
  }
  async function logIn(mail, password, userType, persistence) {
    try {
      if (persistence) {
        await setPersistence(auth, browserLocalPersistence);
      }
      const userCredential = await signInWithEmailAndPassword(
        auth,
        mail,
        password
      );
      const currentUser = userCredential.user;
      const token = await currentUser.getIdToken();
      Cookies.set("authToken", token, { secure: true, sameSite: "strict" });
      Cookies.set("userType", userType, { secure: true, sameSite: "strict" });
      const loginCred = await login(userType)
      // console.log("WE ARE HERE", loginCred)
      // setUser(currentUser);

      // alert(token)

      // Store the authentication token in a cookie
    } catch (error) {
      console.error("Firebase Sign In Error", error);
      throw error;
    }
  }

  async function logOut() {
    try {
      await signOut(auth);
      Cookies.remove("authToken");
      localStorage.removeItem("userProfile");
      window.location.href = '/login'; // Ensure the history.push is used after signOut
    } catch (error) {
      console.error("Firebase Sign Out Error", error);
      throw error;
    }
  }
  useEffect(() => {


    const unsubscribe = onAuthStateChanged(auth, async (uid) => {
      setUid(uid);
      if (uid) {
        const token = await uid.getIdToken();
        Cookies.set("authToken", token, { secure: true, sameSite: "strict" });
      } else {
        // Clear the authentication token cookie when the user logs out
        Cookies.remove("authToken");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <userContext.Provider
      value={{ getUserProfile, userProfile, logIn, logOut, sendResetLink, searchedProfile, setSearchedProfile }}
    >
      {children}
    </userContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userContext);
}

// Make a request to your backend to fetch the user profile
// const response = await fetch(apiKey+"/api/v1/user/profile", {
//   method: "POST",
//   headers: {
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//     // Add other headers as needed
//   },
//   body:JSON.stringify({
//     userType: userType
//   })
// });

// if (response.ok) {
//   const userProfileData = await response.json();
//   console.log(userProfileData);
//   setUser(userProfileData);
// } else {
//   // Handle the case where the request fails
//   console.error("Failed to fetch user profile");
// }
