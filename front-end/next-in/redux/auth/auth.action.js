import axios from "axios";
import { AUTH_ERROR, AUTH_LOGIN_SUCCESS, AUTH_REGISTER_SUCCESS } from "./auth.types";

let API = process.env.NEXT_PUBLIC_API_LINK;
export const registerUser = (creds) => async (dispatch) => {
    try {
        const res = await axios.post(`${API}/auth/signup`, creds);
        const data = await res.data;
        if (!data.error) {
            dispatch({ type: AUTH_REGISTER_SUCCESS, payload: data });
        }
        else {
            dispatch({ type: AUTH_ERROR })
        }
    } catch (error) {
        console.log(error.message)
    }
};


export const loginUser = (creds) => async (dispatch) => {
    try {
        const res = await axios.post(`${API}/auth/login`, creds);
        const data = await res.data;
        if (!data.error) {
            dispatch({ type: AUTH_LOGIN_SUCCESS, payload: data });
        }
        else {
            dispatch({ type: AUTH_ERROR })
        }
    } catch (error) {
        dispatch({ type: AUTH_ERROR })
        console.log(error.message)
    }
};