import React from 'react';

export default function Duration(prop: { duration: number[] }) {
  const { duration } = prop;
  if (!duration || duration.length === 0) return <></>;
  const parts = [];
  if (duration[0]) parts.push(`${duration[0]} mo `);
  if (duration[1]) parts.push(`${duration[1]} day `);
  if (duration[2]) parts.push(`${duration[2]} hr `);
  if (duration[3]) parts.push(`${duration[3]} min `);
  if (duration[4]) parts.push(`${duration[4]} sec `);
  return <>{parts.join(' ')}</>;
}
