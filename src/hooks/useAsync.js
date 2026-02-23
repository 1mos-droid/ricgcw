import { useState, useCallback } from 'react';

/**
 * Custom hook to handle asynchronous operations with loading and error states.
 * @param {Function} asyncFunction - The async function to execute.
 * @param {boolean} immediate - Whether to execute the function immediately.
 */
export const useAsync = (asyncFunction, immediate = false) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback((...args) => {
    setStatus('pending');
    setValue(null);
    setError(null);

    return asyncFunction(...args)
      .then((response) => {
        setValue(response);
        setStatus('success');
        return response;
      })
      .catch((error) => {
        setError(error);
        setStatus('error');
        throw error;
      });
  }, [asyncFunction]);

  // Execute immediately if requested
  useState(() => {
    if (immediate) {
      execute();
    }
  });

  return { execute, status, value, error, 
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    isIdle: status === 'idle'
  };
};
