"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Folder, File } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface TreeProps {
  data?: TreeNode[]
  initialSelectedId?: string
  onSelectChange?: (node: TreeNode) => void
}

interface TreeNode {
  id: string
  name: string
  children?: TreeNode[]
}

export function Tree({ data = [], initialSelectedId, onSelectChange }: TreeProps) {
  const [selectedId, setSelectedId] = React.useState<string | undefined>(
    initialSelectedId
  )

  const handleSelectChange = (node: TreeNode) => {
    setSelectedId(node.id)
    onSelectChange?.(node)
  }

  return (
    <div className="w-full overflow-auto">
      {data.length > 0 ? (
        <TreeNodes
          nodes={data}
          selectedId={selectedId}
          onSelectChange={handleSelectChange}
        />
      ) : (
        <div className="p-2 text-sm text-muted-foreground">No items to display</div>
      )}
    </div>
  )
}

interface TreeNodesProps {
  nodes: TreeNode[]
  level?: number
  selectedId?: string
  onSelectChange: (node: TreeNode) => void
}

function TreeNodes({
  nodes,
  level = 0,
  selectedId,
  onSelectChange,
}: TreeNodesProps) {
  return (
    <>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={level}
          selectedId={selectedId}
          onSelectChange={onSelectChange}
        />
      ))}
    </>
  )
}

interface TreeNodeProps {
  node: TreeNode
  level: number
  selectedId?: string
  onSelectChange: (node: TreeNode) => void
}

function TreeNode({ node, level, selectedId, onSelectChange }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasChildren = node.children && node.children.length > 0

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleSelect = () => {
    onSelectChange(node)
  }

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start px-2 py-1 text-sm font-normal",
          selectedId === node.id && "bg-muted font-medium"
        )}
        style={{ paddingLeft: `${(level + 1) * 12}px` }}
        onClick={handleSelect}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={handleExpand}
          >
            <span className="sr-only">{isExpanded ? "Collapse" : "Expand"}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        )}
        {hasChildren ? (
          <Folder className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : (
          <File className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
        {node.name}
      </Button>
      {hasChildren && isExpanded && node.children && (
        <TreeNodes
          nodes={node.children}
          level={level + 1}
          selectedId={selectedId}
          onSelectChange={onSelectChange}
        />
      )}
    </div>
  )
}