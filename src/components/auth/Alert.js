import React from 'react';

export default function Alert({ error }) {
  return <div className="text-center pt-3 ${color}">{error}</div>;
}
