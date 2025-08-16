import * as React from "react"
import { cn } from "../../lib/utils"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => onOpenChange?.(false)}
          />
          <div className="relative z-[1401]">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

const DialogTrigger = ({ children, asChild, ...props }: { 
  children: React.ReactNode
  asChild?: boolean
  onClick?: () => void
}) => {
  return (
    <div {...props}>
      {children}
    </div>
  )
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  const localRef = React.useRef<HTMLDivElement | null>(null)

  const setRefs = (node: HTMLDivElement | null) => {
    localRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
    }
  }

  React.useEffect(() => {
    const root = localRef.current
    if (!root) return

    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    ;(first || root).focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (focusable.length === 0) {
        e.preventDefault()
        return
      }
      const active = document.activeElement
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault()
          ;(last as HTMLElement).focus()
        }
      } else {
        if (active === last || !root.contains(active)) {
          e.preventDefault()
          ;(first as HTMLElement).focus()
        }
      }
    }

    root.addEventListener('keydown', handleKeyDown as any)
    return () => root.removeEventListener('keydown', handleKeyDown as any)
  }, [])

  return (
    <div
      ref={setRefs}
      tabIndex={-1}
      className={cn(
        "fixed left-1/2 top-1/2 z-[1401] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-white/95 dark:bg-gray-900/90 backdrop-blur p-6 shadow-lg rounded-2xl will-change-transform motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
