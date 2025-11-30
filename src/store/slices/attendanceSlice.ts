import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Attendance, AttendanceState, AttendanceSummary } from '@/types';
import { attendanceAPI, managerAttendanceAPI } from '@/services/api';

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

// Async Thunks
export const checkIn = createAsyncThunk(
  'attendance/checkIn',
  async (_, { rejectWithValue }) => {
    try {
      const attendance = await attendanceAPI.checkIn();
      return attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check in');
    }
  }
);

export const checkOut = createAsyncThunk(
  'attendance/checkOut',
  async (_, { rejectWithValue }) => {
    try {
      const attendance = await attendanceAPI.checkOut();
      return attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check out');
    }
  }
);

export const fetchTodayAttendance = createAsyncThunk(
  'attendance/fetchToday',
  async (_, { rejectWithValue }) => {
    try {
      const attendance = await attendanceAPI.getToday();
      return attendance;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch today attendance');
    }
  }
);

export const fetchMyHistory = createAsyncThunk(
  'attendance/fetchMyHistory',
  async ({ month, year }: { month?: number; year?: number } = {}, { rejectWithValue }) => {
    try {
      const history = await attendanceAPI.getMyHistory(month, year);
      return history;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'attendance/fetchSummary',
  async ({ month, year }: { month?: number; year?: number } = {}, { rejectWithValue }) => {
    try {
      const summary = await attendanceAPI.getMySummary(month, year);
      return summary;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendance: (state) => {
      state.todayAttendance = null;
      state.myHistory = [];
      state.allAttendance = [];
      state.summary = initialState.summary;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Check In
    builder.addCase(checkIn.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(checkIn.fulfilled, (state, action) => {
      state.isLoading = false;
      state.todayAttendance = action.payload;
      // Optimistically update history if needed, but usually we refetch
    });
    builder.addCase(checkIn.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Check Out
    builder.addCase(checkOut.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(checkOut.fulfilled, (state, action) => {
      state.isLoading = false;
      state.todayAttendance = action.payload;
    });
    builder.addCase(checkOut.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Today
    builder.addCase(fetchTodayAttendance.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTodayAttendance.fulfilled, (state, action) => {
      state.isLoading = false;
      state.todayAttendance = action.payload;
    });
    builder.addCase(fetchTodayAttendance.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch History
    builder.addCase(fetchMyHistory.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyHistory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.myHistory = action.payload;
    });
    builder.addCase(fetchMyHistory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Summary
    builder.addCase(fetchSummary.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchSummary.fulfilled, (state, action) => {
      state.isLoading = false;
      state.summary = action.payload;
    });
    builder.addCase(fetchSummary.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearAttendance } = attendanceSlice.actions;

export default attendanceSlice.reducer;
