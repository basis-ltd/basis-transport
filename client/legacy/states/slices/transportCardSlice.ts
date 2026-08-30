import { TransportCard } from '@/types/transportCard.type';
import { createSlice } from '@reduxjs/toolkit';

interface TransportCardState {
  transportCardsList: TransportCard[];
  transportCard?: TransportCard;
  selectedTransportCard?: TransportCard;
  deleteTransportCard: boolean;
  updateTransportCard: boolean;
  createTransportCard: boolean;
}

const initialState: TransportCardState = {
  transportCardsList: [],
  transportCard: undefined,
  selectedTransportCard: undefined,
  deleteTransportCard: false,
  updateTransportCard: false,
  createTransportCard: false,
};

const transportCardSlice = createSlice({
  name: 'transportCard',
  initialState,
  reducers: {
    setTransportCardsList: (state, action) => {
      state.transportCardsList = action.payload;
    },
    setTransportCard: (state, action) => {
      state.transportCard = action.payload;
    },
    setSelectedTransportCard: (state, action) => {
      state.selectedTransportCard = action.payload;
    },
    setDeleteTransportCard: (state, action) => {
      state.deleteTransportCard = action.payload;
    },
    setUpdateTransportCard: (state, action) => {
      state.updateTransportCard = action.payload;
    },
    setCreateTransportCard: (state, action) => {
      state.createTransportCard = action.payload;
    },
  },
});

export const {
  setTransportCardsList,
  setTransportCard,
  setSelectedTransportCard,
  setDeleteTransportCard,
  setUpdateTransportCard,
  setCreateTransportCard,
} = transportCardSlice.actions;

export default transportCardSlice.reducer;
