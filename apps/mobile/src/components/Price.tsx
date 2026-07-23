import React from 'react';
import { Text, TextStyle } from 'react-native';

interface Props {
  amount: number | string;
  style?: TextStyle;
  suffix?: string;
}

// Poppins does not include the Indian Rupee glyph (U+20B9).
// Keeping ₹ in a nested Text without fontFamily forces Android to use
// the system font for that single character, preventing the UTF-8
// fallback rendering bug ("â‚¹") seen on certain Android devices.
export default function Price({ amount, style, suffix }: Props) {
  const formatted = typeof amount === 'number'
    ? amount.toLocaleString('en-IN')
    : amount;

  return (
    <Text style={style}>
      <Text style={{ fontFamily: undefined }}>₹</Text>
      {formatted}
      {suffix ?? ''}
    </Text>
  );
}
