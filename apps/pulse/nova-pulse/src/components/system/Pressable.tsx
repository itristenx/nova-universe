import React from 'react';

type PressableProps = React.HTMLAttributes<HTMLButtonElement> & {
  as?: 'button' | 'div';
};

const Pressable: React.FC<PressableProps> = ({
  as = 'button',
  className = '',
  children,
  ...props
}) => {
  const Ref = React.useRef<HTMLButtonElement | HTMLDivElement | null>(null);

  const createRipple = (event: React.MouseEvent | React.TouchEvent) => {
    const container = Ref.current as HTMLElement | null;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x =
      ('clientX' in event ? event.clientX : (event as any).touches?.[0]?.clientX) -
      rect.left -
      size / 2;
    const y =
      ('clientY' in event ? event.clientY : (event as any).touches?.[0]?.clientY) -
      rect.top -
      size / 2;
    ripple.style.position = 'absolute';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.borderRadius = '9999px';
    ripple.style.pointerEvents = 'none';
    ripple.style.backgroundColor = 'rgba(0,0,0,0.08)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'pressable-ripple 450ms ease-out';
    container.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  };

  const Comp: any = as;
  return (
    <Comp
      ref={Ref as any}
      className={`relative overflow-hidden transition-transform duration-150 active:scale-[0.98] ${className}`}
      onMouseDown={(e: any) => {
        createRipple(e);
        (props as any).onMouseDown?.(e);
      }}
      onTouchStart={(e: any) => {
        createRipple(e);
        (props as any).onTouchStart?.(e);
      }}
      {...props}
    >
      {children}
      <style>{`
        @keyframes pressable-ripple {
          to { transform: scale(1); opacity: 0; }
        }
      `}</style>
    </Comp>
  );
};

export default Pressable;
