import { combineReducers } from "redux";
import states from "./states";
import counties from "./counties";
// import ct from "./ct";
import nyt from "./nyt";

const rootReducer = combineReducers({ states, counties, /* ct, */ nyt });

export default rootReducer;
