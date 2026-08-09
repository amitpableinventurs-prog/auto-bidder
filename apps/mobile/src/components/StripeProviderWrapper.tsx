import React from 'react';

/**
 * Web-safe fallback for StripeProvider.
 * This version does nothing and just renders children.
 */
export const StripeProviderWrapper = ({ children, publishableKey }: { children: React.ReactNode, publishableKey: string }) => {
  return <>{children}</>;
};

export default StripeProviderWrapper;
