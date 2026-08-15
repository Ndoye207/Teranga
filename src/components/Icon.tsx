import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  name: string;
  size?: number;
  color?: string;
  family?: string; // Kept for backward compatibility but ignored
}

export default function Icon({ name, size = 22, color = '#1B3A6B' }: Props) {
  return <Ionicons name={name} size={size} color={color} />;
}