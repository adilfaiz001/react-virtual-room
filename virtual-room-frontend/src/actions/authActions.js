import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

import {
  GET_ERRORS,
  SET_CURRENT_USER,
  USER_LOADING
} from "./types";

let API_URL = 'https://api.virtualroom.thelattice.org'
// Register User
export const registerUser = (userData, history) => dispatch => {
  axios
    .post(`${API_URL}/api/login/signup`, userData)
    .then(res => history.push("/login")) // re-direct to login on successful register
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

// Login - get user token
export const loginUser = userData => dispatch => {
  axios
    .post(`${API_URL}/api/login/login`, userData)
    .then(res => {
      // Save to localStorage
      // Set token to localStorage
      const  token  = res.data.data.token;
      localStorage.setItem("jwtToken", token);
      // Set token to Auth header
      setAuthToken(token);
      // Decode token to get user data
      console.log(token)
      const decoded = jwt_decode(token);
      console.log("here");
      // Set current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
        /*
      dispatch({
        type: GET_ERRORS,
        payload: er
      })
      */
     console.log(err.response)
    );
};
// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};
// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  };
};
// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to empty object {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};