import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { wheel } from "./features/wheel";

export const store = configureStore({ reducer: { wheel: wheel.reducer } });

export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
