import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

/**
 * Native implementation of StripeProvider.
 * Uses the real @stripe/stripe-react-native module.
 */
export const StripeProviderWrapper = ({ children, publishableKey }: { children: React.ReactNode, publishableKey: string }) => {
  return (
    <StripeProvider publishableKey={publishableKey}>
      {children}
    </StripeProvider>
  );
};

export default StripeProviderWrapper;
