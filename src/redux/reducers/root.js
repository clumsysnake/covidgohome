import { combineReducers } from "redux";
import states from "./states";
import counties from "./counties";

const rootReducer = combineReducers({ states, counties });

export default rootReducer;
