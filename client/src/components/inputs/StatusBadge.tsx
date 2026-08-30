import {
  faBan,
  faCheck,
  faCircleDot,
  faClock,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  capitalizeString,
  getStatusBackgroundColor,
  getStatusTone,
  type StatusTone,
} from '@/helpers/strings.helper';
import { cn } from '@/lib/utils';

/**
 * The icon is not decoration — it is the half of the message that survives a
 * greyscale screenshot and the only half that reaches a screen reader. Status
 * must never be carried by fill alone.
 */
const toneIcon: Record<StatusTone, typeof faCheck> = {
  active: faCircleDot,
  done: faCheck,
  pending: faClock,
  failed: faBan,
  draft: faMinus,
};

const StatusBadge = ({
  status,
  className,
}: {
  status?: string;
  className?: string;
}) => {
  if (!status) return null;

  return (
    <span className={cn(getStatusBackgroundColor(status), className)}>
      <FontAwesomeIcon
        icon={toneIcon[getStatusTone(status)]}
        className="size-3 shrink-0"
        aria-hidden="true"
      />
      {capitalizeString(status.replace(/_/g, ' '))}
    </span>
  );
};

export default StatusBadge;
