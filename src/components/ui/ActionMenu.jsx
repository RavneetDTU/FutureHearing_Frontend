import clsx from 'clsx';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Button } from './Button';

const GAP = 6;
const VIEWPORT_MARGIN = 8;
const FALLBACK_WIDTH = 220;
const FALLBACK_HEIGHT = 160;

/**
 * actions: [{ label, icon, onClick?, to?, danger?, hidden?, divider? }]
 * Rendered into document.body with position:fixed so table/card overflow cannot clip it.
 */
export function ActionMenu({ actions = [], label = 'Actions', trigger }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, ready: false });
  const anchorRef = useRef(null);
  const menuRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const a = anchor.getBoundingClientRect();
    const menu = menuRef.current;
    const width = menu?.offsetWidth || FALLBACK_WIDTH;
    const height = menu?.offsetHeight || FALLBACK_HEIGHT;
    const spaceBelow = window.innerHeight - a.bottom - VIEWPORT_MARGIN;
    const spaceAbove = a.top - VIEWPORT_MARGIN;
    const openAbove = spaceBelow < height && spaceAbove > spaceBelow;
    const top = openAbove ? a.top - GAP - height : a.bottom + GAP;
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, a.right - width),
      Math.max(VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN),
    );
    setPosition({ top: Math.max(VIEWPORT_MARGIN, top), left, ready: true });
  }, []);

  const toggle = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setOpen((isOpen) => {
      if (!isOpen) {
        // Place the menu before paint so it never flashes at (0,0) or stays visibility:hidden.
        const a = anchorRef.current?.getBoundingClientRect();
        if (a) {
          setPosition({
            top: a.bottom + GAP,
            left: Math.max(VIEWPORT_MARGIN, a.right - FALLBACK_WIDTH),
            ready: true,
          });
        }
      }
      return !isOpen;
    });
  }, []);

  const setMenuNode = useCallback(
    (node) => {
      menuRef.current = node;
      if (node) updatePosition();
    },
    [updatePosition],
  );

  useLayoutEffect(() => {
    if (open) updatePosition();
    else setPosition({ top: 0, left: 0, ready: false });
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;
    // Ignore the same gesture that opened the menu so it cannot close immediately.
    let armed = false;
    const arm = window.setTimeout(() => {
      armed = true;
    }, 0);

    const onPointer = (e) => {
      if (!armed) return;
      if (anchorRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('pointerdown', onPointer, true);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.clearTimeout(arm);
      document.removeEventListener('pointerdown', onPointer, true);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, close, updatePosition]);

  const visible = actions.filter((a) => !a.hidden);
  if (!visible.length) return null;

  const stopRowClick = (e) => e.stopPropagation();

  return (
    <div className="dropdown" ref={anchorRef} onClick={stopRowClick} onPointerDown={stopRowClick}>
      {trigger ? (
        trigger({ open, toggle })
      ) : (
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          icon={MoreHorizontal}
          aria-label={label}
          aria-expanded={open}
          aria-haspopup="menu"
          onClick={toggle}
          onPointerDown={stopRowClick}
        />
      )}
      {open &&
        createPortal(
          <div
            ref={setMenuNode}
            className="popover popover-floating"
            role="menu"
            style={{ top: position.top, left: position.left, visibility: position.ready ? 'visible' : 'hidden' }}
            onClick={stopRowClick}
            onPointerDown={stopRowClick}
          >
            {visible.map((action, i) =>
              action.divider ? (
                <div key={`d-${i}`} className="menu-divider" />
              ) : action.to ? (
                <Link
                  key={action.label}
                  to={action.to}
                  role="menuitem"
                  className={clsx('option', action.danger && 'is-danger')}
                  onClick={close}
                >
                  {action.icon && <action.icon size={16} />}
                  {action.label}
                </Link>
              ) : (
                <button
                  key={action.label}
                  type="button"
                  role="menuitem"
                  className={clsx('option', action.danger && 'is-danger')}
                  disabled={action.disabled}
                  onClick={() => {
                    close();
                    action.onClick?.();
                  }}
                >
                  {action.icon && <action.icon size={16} />}
                  {action.label}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
