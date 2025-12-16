'use client';

import { create } from 'zustand';

/**
 * Processing State Store
 * Tracks all ongoing processing operations to prevent modal interruptions
 */

interface ProcessingState {
  uploadInProgress: boolean;
  videoProcessing: boolean;
  exportInProgress: boolean;
  paymentProcessing: boolean;
  transcriptionInProgress: boolean;
  
  // Actions
  setUploadInProgress: (inProgress: boolean) => void;
  setVideoProcessing: (processing: boolean) => void;
  setExportInProgress: (inProgress: boolean) => void;
  setPaymentProcessing: (processing: boolean) => void;
  setTranscriptionInProgress: (inProgress: boolean) => void;
  
  // Computed
  isProcessing: () => boolean;
  canShowModal: (isCritical: boolean) => boolean;
}

export const useProcessingState = create<ProcessingState>((set, get) => ({
  uploadInProgress: false,
  videoProcessing: false,
  exportInProgress: false,
  paymentProcessing: false,
  transcriptionInProgress: false,

  setUploadInProgress: (inProgress) => {
    console.log(`[ProcessingState] Upload: ${inProgress}`);
    set({ uploadInProgress: inProgress });
  },

  setVideoProcessing: (processing) => {
    console.log(`[ProcessingState] Video Processing: ${processing}`);
    set({ videoProcessing: processing });
  },

  setExportInProgress: (inProgress) => {
    console.log(`[ProcessingState] Export: ${inProgress}`);
    set({ exportInProgress: inProgress });
  },

  setPaymentProcessing: (processing) => {
    console.log(`[ProcessingState] Payment: ${processing}`);
    set({ paymentProcessing: processing });
  },

  setTranscriptionInProgress: (inProgress) => {
    console.log(`[ProcessingState] Transcription: ${inProgress}`);
    set({ transcriptionInProgress: inProgress });
  },

  isProcessing: () => {
    const state = get();
    return (
      state.uploadInProgress ||
      state.videoProcessing ||
      state.exportInProgress ||
      state.paymentProcessing ||
      state.transcriptionInProgress
    );
  },

  canShowModal: (isCritical: boolean) => {
    const state = get();
    const processing = state.isProcessing();
    
    // Critical modals (errors, payment issues) can always show
    if (isCritical) {
      return true;
    }
    
    // Non-critical modals blocked during processing
    if (processing) {
      console.log(`[ProcessingState] Blocking non-critical modal during processing`);
      return false;
    }
    
    return true;
  },
}));

/**
 * Hook to check if any processing is happening
 */
export function useIsProcessing(): boolean {
  return useProcessingState((state) => state.isProcessing());
}

/**
 * Hook to check if modal can be shown
 */
export function useCanShowModal(isCritical: boolean = false): boolean {
  return useProcessingState((state) => state.canShowModal(isCritical));
}
