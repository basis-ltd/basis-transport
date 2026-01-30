import {
  capitalizeString,
  getStatusBackgroundColor,
} from '@/helpers/strings.helper';
import React from 'react';

interface TableStatusLabelProps {
  status?: string;
}

export const TableStatusLabel: React.FC<TableStatusLabelProps> = ({
  status,
}) => {
  if (!status) return null;

  return (
    <p className={`${getStatusBackgroundColor(status)} shadow-sm`}>
      {capitalizeString(status)}
    </p>
  );
};

export default TableStatusLabel;
