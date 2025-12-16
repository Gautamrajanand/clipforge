'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { modalQueue, ModalConfig } from '@/lib/modalQueue';

interface ModalQueueContextType {
  currentModal: ModalConfig | null;
  queueLength: number;
  showModal: (config: ModalConfig) => void;
  closeModal: () => void;
  clearQueue: () => void;
}

const ModalQueueContext = createContext<ModalQueueContextType | undefined>(undefined);

export function ModalQueueProvider({ children }: { children: React.ReactNode }) {
  const [currentModal, setCurrentModal] = useState<ModalConfig | null>(null);
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    // Subscribe to modal queue changes
    const unsubscribe = modalQueue.subscribe((current) => {
      setCurrentModal(current);
      setQueueLength(modalQueue.getQueueLength());
    });

    // Initial state
    setCurrentModal(modalQueue.getCurrent());
    setQueueLength(modalQueue.getQueueLength());

    return unsubscribe;
  }, []);

  const showModal = (config: ModalConfig) => {
    modalQueue.enqueue(config);
  };

  const closeModal = () => {
    modalQueue.dequeue();
  };

  const clearQueue = () => {
    modalQueue.clear();
  };

  return (
    <ModalQueueContext.Provider
      value={{
        currentModal,
        queueLength,
        showModal,
        closeModal,
        clearQueue,
      }}
    >
      {children}
      {/* Render current modal */}
      {currentModal && (
        <currentModal.component
          {...currentModal.props}
          isOpen={true}
          onClose={closeModal}
        />
      )}
    </ModalQueueContext.Provider>
  );
}

export function useModalQueue() {
  const context = useContext(ModalQueueContext);
  if (context === undefined) {
    throw new Error('useModalQueue must be used within a ModalQueueProvider');
  }
  return context;
}
