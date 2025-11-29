import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Attendance, AttendanceState, AttendanceSummary } from '@/types';

const initialState: AttendanceState = {
  todayAttendance: null,
  myHistory: [],
  allAttendance: [],
  summary: {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    totalHours: 0,
  },
  isLoading: false,
  error: null,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTodayAttendance: (state, action: PayloadAction<Attendance | null>) => {
      state.todayAttendance = action.payload;
    },
    checkIn: (state, action: PayloadAction<Attendance>) => {
      state.todayAttendance = action.payload;
      state.myHistory = [action.payload, ...state.myHistory.filter(a => a.date !== action.payload.date)];
    },
    checkOut: (state, action: PayloadAction<Attendance>) => {
      state.todayAttendance = action.payload;
      state.myHistory = state.myHistory.map(a => 
        a.id === action.payload.id ? action.payload : a
      );
    },
    setMyHistory: (state, action: PayloadAction<Attendance[]>) => {
      state.myHistory = action.payload;
    },
    setAllAttendance: (state, action: PayloadAction<Attendance[]>) => {
      state.allAttendance = action.payload;
    },
    setSummary: (state, action: PayloadAction<AttendanceSummary>) => {
      state.summary = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAttendance: (state) => {
      state.todayAttendance = null;
      state.myHistory = [];
      state.allAttendance = [];
      state.summary = initialState.summary;
    },
  },
});

export const {
  setLoading,
  setTodayAttendance,
  checkIn,
  checkOut,
  setMyHistory,
  setAllAttendance,
  setSummary,
  setError,
  clearAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
