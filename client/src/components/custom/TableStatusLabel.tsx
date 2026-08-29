import {
  capitalizeString,
  getStatusBackgroundColor,
  getStatusTone,
} from '@/helpers/strings.helper';
import { Ban, Check, CircleDot, Clock, Minus } from 'lucide-react';
import React from 'react';

interface TableStatusLabelProps {
  status?: string;
}

/**
 * The icon is not decoration — it is the half of the message that survives a
 * greyscale screenshot and reaches a screen reader. Never drop it in favour of
 * the fill alone.
 */
const toneIcon = {
  active: CircleDot,
  done: Check,
  pending: Clock,
  failed: Ban,
  draft: Minus,
} as const;

export const TableStatusLabel: React.FC<TableStatusLabelProps> = ({
  status,
}) => {
  if (!status) return null;

  const Icon = toneIcon[getStatusTone(status)];

  return (
    <p className={getStatusBackgroundColor(status)}>
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {capitalizeString(status.replace(/_/g, ' '))}
    </p>
  );
};

export default TableStatusLabel;
