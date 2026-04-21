import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    // Stores the invitation token for a pending technician's first login.
    // Set on login → cleared after profile completion.
    invitationToken: null,
  },
  reducers: {
    setInvitationToken: (state, action) => {
      state.invitationToken = action.payload;
    },
    clearInvitationToken: (state) => {
      state.invitationToken = null;
    },
  },
});

export const { setInvitationToken, clearInvitationToken } = authSlice.actions;
export default authSlice.reducer;
