import React from 'react';

export const EmptyState: React.FC<{ title?: string; description?: string }> = ({
  title = 'Nothing here yet',
  description = 'There is no content to show at the moment.',
}) => {
  return (
    <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14 }}>{description}</div>
    </div>
  );
};
