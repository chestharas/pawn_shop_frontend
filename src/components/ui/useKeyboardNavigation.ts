// hooks/useKeyboardNavigation.ts
'use client';

import { useRef, useCallback, useEffect } from 'react';

export interface NavigationInputRef {
  focus: () => void;
  blur: () => void;
  select: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
}

interface UseKeyboardNavigationOptions {
  circular?: boolean; // Allow wrapping from last to first input
  skipDisabled?: boolean; // Skip disabled inputs during navigation
}

export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}) {
  const { circular = true, skipDisabled = true } = options;
  const inputRefs = useRef<Map<string, NavigationInputRef>>(new Map());
  const inputOrder = useRef<string[]>([]);
  const disabledInputs = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    
    // Capture current values to avoid ESLint warnings
    const currentInputRefs = inputRefs.current;
    const currentInputOrder = inputOrder.current;
    const currentDisabledInputs = disabledInputs.current;
    
    return () => {
      isMountedRef.current = false;
      
      // Clean up all refs on unmount
      currentInputRefs.clear();
      currentInputOrder.length = 0;
      currentDisabledInputs.clear();
    };
  }, []);

  // Register an input with the navigation system
  const registerInput = useCallback((id: string, ref: NavigationInputRef, disabled = false) => {
    if (!isMountedRef.current) return;
    
    inputRefs.current.set(id, ref);
    if (!inputOrder.current.includes(id)) {
      inputOrder.current.push(id);
    }
    
    if (disabled) {
      disabledInputs.current.add(id);
    } else {
      disabledInputs.current.delete(id);
    }
  }, []);

  // Unregister an input
  const unregisterInput = useCallback((id: string) => {
    inputRefs.current.delete(id);
    inputOrder.current = inputOrder.current.filter(inputId => inputId !== id);
    disabledInputs.current.delete(id);
  }, []);

  // Update disabled state of an input
  const setInputDisabled = useCallback((id: string, disabled: boolean) => {
    if (!isMountedRef.current) return;
    
    if (disabled) {
      disabledInputs.current.add(id);
    } else {
      disabledInputs.current.delete(id);
    }
  }, []);

  // Get next input ID in the sequence
  const getNextInput = useCallback((currentId: string): string | null => {
    const currentIndex = inputOrder.current.indexOf(currentId);
    if (currentIndex === -1) return null;

    let nextIndex = currentIndex + 1;
    
    while (nextIndex < inputOrder.current.length || (circular && nextIndex === inputOrder.current.length)) {
      if (circular && nextIndex >= inputOrder.current.length) {
        nextIndex = 0;
      }
      
      if (nextIndex >= inputOrder.current.length) break;
      
      const nextId = inputOrder.current[nextIndex];
      
      if (!skipDisabled || !disabledInputs.current.has(nextId)) {
        return nextId;
      }
      
      nextIndex++;
      
      // Prevent infinite loop
      if (nextIndex === currentIndex || (circular && nextIndex > inputOrder.current.length)) {
        break;
      }
    }
    
    return null;
  }, [circular, skipDisabled]);

  // Get previous input ID in the sequence
  const getPreviousInput = useCallback((currentId: string): string | null => {
    const currentIndex = inputOrder.current.indexOf(currentId);
    if (currentIndex === -1) return null;

    let prevIndex = currentIndex - 1;
    
    while (prevIndex >= 0 || (circular && prevIndex === -1)) {
      if (circular && prevIndex < 0) {
        prevIndex = inputOrder.current.length - 1;
      }
      
      if (prevIndex < 0) break;
      
      const prevId = inputOrder.current[prevIndex];
      
      if (!skipDisabled || !disabledInputs.current.has(prevId)) {
        return prevId;
      }
      
      prevIndex--;
      
      // Prevent infinite loop
      if (prevIndex === currentIndex || (circular && prevIndex < -1)) {
        break;
      }
    }
    
    return null;
  }, [circular, skipDisabled]);

  // Navigate to specific input
  const navigateToInput = useCallback((id: string) => {
    if (!isMountedRef.current) return false;
    
    const inputRef = inputRefs.current.get(id);
    if (inputRef && !disabledInputs.current.has(id)) {
      try {
        // Safely attempt to focus the input
        inputRef.focus();
        return true;
      } catch (error) {
        // Element no longer exists or is not focusable, clean it up
        console.warn(`Failed to focus input ${id}, removing from navigation:`, error);
        unregisterInput(id);
        return false;
      }
    }
    return false;
  }, [unregisterInput]);

  // Navigate to next input
  const navigateNext = useCallback((currentId: string) => {
    const nextId = getNextInput(currentId);
    if (nextId) {
      return navigateToInput(nextId);
    }
    return false;
  }, [getNextInput, navigateToInput]);

  // Navigate to previous input
  const navigatePrevious = useCallback((currentId: string) => {
    const prevId = getPreviousInput(currentId);
    if (prevId) {
      return navigateToInput(prevId);
    }
    return false;
  }, [getPreviousInput, navigateToInput]);

  // Navigate to first input
  const navigateToFirst = useCallback(() => {
    for (const id of inputOrder.current) {
      if (!skipDisabled || !disabledInputs.current.has(id)) {
        return navigateToInput(id);
      }
    }
    return false;
  }, [navigateToInput, skipDisabled]);

  // Navigate to last input
  const navigateToLast = useCallback(() => {
    for (let i = inputOrder.current.length - 1; i >= 0; i--) {
      const id = inputOrder.current[i];
      if (!skipDisabled || !disabledInputs.current.has(id)) {
        return navigateToInput(id);
      }
    }
    return false;
  }, [navigateToInput, skipDisabled]);

  // Get all values from registered inputs
  const getAllValues = useCallback(() => {
    const values: Record<string, string> = {};
    for (const [id, ref] of inputRefs.current) {
      values[id] = ref.getValue();
    }
    return values;
  }, []);

  // Set all values for registered inputs
  const setAllValues = useCallback((values: Record<string, string>) => {
    for (const [id, value] of Object.entries(values)) {
      const ref = inputRefs.current.get(id);
      if (ref) {
        ref.setValue(value);
      }
    }
  }, []);

  // Clear all inputs
  const clearAllInputs = useCallback(() => {
    for (const ref of inputRefs.current.values()) {
      ref.setValue('');
    }
  }, []);

  // Get navigation handlers for a specific input
  const getNavigationHandlers = useCallback((id: string) => ({
    onEnterKey: () => navigateNext(id),
    onArrowDown: () => navigateNext(id),
    onArrowUp: () => navigatePrevious(id),
    onEscapeKey: () => {
      if (!isMountedRef.current) return;
      
      const ref = inputRefs.current.get(id);
      if (ref) {
        try {
          ref.blur();
        } catch (error) {
          // Element no longer exists, clean it up
          console.warn(`Failed to blur input ${id}, removing from navigation:`, error);
          unregisterInput(id);
        }
      }
    }
  }), [navigateNext, navigatePrevious, unregisterInput]);

  return {
    registerInput,
    unregisterInput,
    setInputDisabled,
    navigateToInput,
    navigateNext,
    navigatePrevious,
    navigateToFirst,
    navigateToLast,
    getAllValues,
    setAllValues,
    clearAllInputs,
    getNavigationHandlers,
    // Utility functions
    getInputOrder: () => [...inputOrder.current],
    getDisabledInputs: () => new Set(disabledInputs.current),
    getRegisteredInputs: () => new Map(inputRefs.current)
  };
}