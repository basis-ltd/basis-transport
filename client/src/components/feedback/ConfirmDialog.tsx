import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useRef, useState } from 'react';
import Button from '@/components/inputs/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface ConfirmOptions {
  title: string;
  /** What will happen, in the reader's terms. Not a restatement of the title. */
  description: string;
  /** The action's own name, so the button matches the control that opened it. */
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: IconProp;
  /**
   * Marks an action there is no way back from. Colour is not what makes it
   * legible — the icon and the label are — so this only tints the glyph.
   */
  destructive?: boolean;
}

/**
 * Ask before doing something the reader cannot undo, or that reaches outside
 * the page — deleting a record, signing out, handing over device location.
 *
 * Returns the asking function and the element to render. Local state, so there
 * is no provider to install and no global queue to reason about; a screen that
 * needs two confirmations calls the hook twice.
 */
export const useConfirm = () => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback(
    (nextOptions: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolverRef.current = resolve;
        setOptions(nextOptions);
      }),
    []
  );

  const settle = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  const dialog = (
    <Dialog
      open={Boolean(options)}
      onOpenChange={(open) => {
        // Dismissing by escape or scrim is a decline, not an unanswered promise.
        if (!open) settle(false);
      }}
    >
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <FontAwesomeIcon
              icon={options?.icon ?? faTriangleExclamation}
              aria-hidden="true"
              className={`size-4 shrink-0 ${
                options?.destructive ? 'text-(--danger)' : 'text-(--accent-ink)'
              }`}
            />
            {options?.title}
          </DialogTitle>
          <DialogDescription>{options?.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button type="button" onClick={() => settle(false)}>
            {options?.cancelLabel ?? 'Cancel'}
          </Button>
          <Button type="button" primary onClick={() => settle(true)}>
            {options?.confirmLabel ?? 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { confirm, confirmDialog: dialog };
};

export default useConfirm;
