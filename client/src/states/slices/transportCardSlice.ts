import { TransportCard } from '@/types/transportCard.type';
import { createSlice } from '@reduxjs/toolkit';

interface TransportCardState {
  transportCardsList: TransportCard[];
  transportCard?: TransportCard;
  selectedTransportCard?: TransportCard;
}

const initialState: TransportCardState = {
  transportCardsList: [],
  transportCard: undefined,
  selectedTransportCard: undefined,
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
    resetTransportCard: (state) => {
      state.transportCard = undefined;
      state.selectedTransportCard = undefined;
    },
  },
});

export const {
  setTransportCardsList,
  setTransportCard,
  setSelectedTransportCard,
  resetTransportCard,
} = transportCardSlice.actions;

export default transportCardSlice.reducer;
