import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { jobAPI } from "../services/api";

// Async thunks
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await jobAPI.getAllJobs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch jobs");
    }
  }
);

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await jobAPI.getJobById(jobId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch job");
    }
  }
);

export const fetchJobHistory = createAsyncThunk(
  "jobs/fetchJobHistory",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await jobAPI.getJobHistory(jobId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch job history");
    }
  }
);

export const fetchAssignmentHistory = createAsyncThunk(
  "jobs/fetchAssignmentHistory",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await jobAPI.getAssignmentHistory(jobId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch assignment history");
    }
  }
);

export const createNewJob = createAsyncThunk(
  "jobs/createNewJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await jobAPI.createJob(jobData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create job");
    }
  }
);

export const assignTech = createAsyncThunk(
  "jobs/assignTech",
  async ({ jobId, technicianId }, { rejectWithValue }) => {
    try {
      const response = await jobAPI.assignTechnician(jobId, technicianId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign technician");
    }
  }
);

export const reassignTech = createAsyncThunk(
  "jobs/reassignTech",
  async ({ jobId, newTechnicianId, reason, reassignmentType }, { rejectWithValue }) => {
    try {
      const response = await jobAPI.reassignTechnician(
        jobId,
        newTechnicianId,
        reason,
        reassignmentType
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reassign technician");
    }
  }
);

export const updateStatus = createAsyncThunk(
  "jobs/updateStatus",
  async ({ jobId, status }, { rejectWithValue }) => {
    try {
      const response = await jobAPI.updateJobStatus(jobId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const addJobNote = createAsyncThunk(
  "jobs/addNote",
  async ({ jobId, text, role }, { rejectWithValue }) => {
    try {
      const response = await jobAPI.addNote(jobId, text, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add note");
    }
  }
);

const initialState = {
  jobs: [],
  currentJob: null,
  jobHistory: [],
  assignmentHistory: [],
  loading: false,
  error: null,
  filters: {
    status: "",
    clientId: "",
    technicianId: "",
    priority: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const jobSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
      state.jobHistory = [];
      state.assignmentHistory = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Single Job
    builder
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.data;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Job History
    builder
      .addCase(fetchJobHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.jobHistory = action.payload.data || [];
      })
      .addCase(fetchJobHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Assignment History
    builder
      .addCase(fetchAssignmentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignmentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.assignmentHistory = action.payload.data || [];
      })
      .addCase(fetchAssignmentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Job
    builder
      .addCase(createNewJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.push(action.payload.data);
      })
      .addCase(createNewJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Assign Technician
    builder
      .addCase(assignTech.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignTech.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.data;
        const jobIndex = state.jobs.findIndex(
          (job) => job._id === action.payload.data._id
        );
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = action.payload.data;
        }
      })
      .addCase(assignTech.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reassign Technician
    builder
      .addCase(reassignTech.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reassignTech.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.data;
        const jobIndex = state.jobs.findIndex(
          (job) => job._id === action.payload.data._id
        );
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = action.payload.data;
        }
      })
      .addCase(reassignTech.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Status
    builder
      .addCase(updateStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.data;
        const jobIndex = state.jobs.findIndex(
          (job) => job._id === action.payload.data._id
        );
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = action.payload.data;
        }
      })
      .addCase(updateStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Add Note
    builder
      .addCase(addJobNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addJobNote.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.data;
      })
      .addCase(addJobNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, setPagination, clearCurrentJob } =
  jobSlice.actions;
export default jobSlice.reducer;
