import { ChevronLeft, ChevronRight } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  className,
  onToggle,
  isCollapsed,
  collapseDirection = "left",
  withHandle: _withHandle,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  onToggle?: () => void
  isCollapsed?: boolean
  collapseDirection?: "left" | "right"
  withHandle?: boolean
}) => {
  const showExpandChevron = isCollapsed
  const ChevronIcon = showExpandChevron
    ? collapseDirection === "left" ? ChevronRight : ChevronLeft
    : collapseDirection === "left" ? ChevronLeft : ChevronRight

  return (
    <ResizablePrimitive.PanelResizeHandle
      className={cn(
        "relative flex w-1 items-center justify-center transition-colors",
        "bg-border/40 hover:bg-violet-200/60 data-[resize-handle-active]:bg-violet-400/60",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {onToggle && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          title={isCollapsed ? "Expand panel" : "Collapse panel"}
          className={cn(
            "absolute z-20 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm transition-all duration-150",
            "bg-background border-violet-200 text-violet-500",
            "hover:bg-violet-50 hover:border-violet-400 hover:text-violet-700 hover:scale-110",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          )}
        >
          <ChevronIcon className="h-3 w-3" />
        </button>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
