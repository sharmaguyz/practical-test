'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ConfirmationOptions = {
  message: string;
};

type ConfirmationContextType = {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
};

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [resolver, setResolver] = useState<(result: boolean) => void>();

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    setMessage(options.message);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleOk = () => {
    if (resolver) resolver(true);
    cleanup();
  };

  const handleCancel = () => {
    if (resolver) resolver(false);
    cleanup();
  };

  const cleanup = () => {
    setIsOpen(false);
    setMessage('');
    setResolver(undefined);
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[500px] text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirmation</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleOk}
                className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
};

export const useConfirmation = (): ConfirmationContextType => {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error('useConfirmation must be used within a ConfirmationProvider');
  return context;
};
