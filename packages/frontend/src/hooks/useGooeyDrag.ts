import { useState } from "react";

import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { Node } from "shared/types";

type DragState = {
  isDragging: boolean;
  startNode: Node | null;
  dragPosition: Vector2d | null;
};

export default function useGooeyDrag(spaceActions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startNode: null,
    dragPosition: null,
  });
  const [dropPosition, setDropPosition] = useState<Vector2d | null>(null);

  const handleDragStart = (node: Node) => {
    const nodePosition = { x: node.x, y: node.y };
    setDragState({
      isDragging: true,
      startNode: node,
      dragPosition: nodePosition,
    });

    setDropPosition(null);
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const position = e.target.getLayer()?.getRelativePointerPosition();
    if (!position) return;

    setDragState((prev) => ({
      ...prev,
      dragPosition: position,
    }));
  };

  const handleDragEnd = () => {
    const { dragPosition } = dragState;
    setDropPosition(dragPosition);
    setDragState((prev) => ({
      ...prev,
      isDragging: false,
      dragPosition: null,
    }));
  };

  const handlePaletteSelect = (type: Node["type"] | "close") => {
    const { startNode } = dragState;

    if (!startNode || !dropPosition || type === "close") {
      setDropPosition(null);
      return;
    }

    spaceActions.createNode(type, startNode, dropPosition);
    setDragState({ isDragging: false, startNode: null, dragPosition: null });
    setDropPosition(null);
  };

  return {
    drag: {
      isActive: dragState.isDragging,
      startNode: dragState.startNode,
      position: dragState.dragPosition,
      handlers: {
        onDragStart: handleDragStart,
        onDragMove: handleDragMove,
        onDragEnd: handleDragEnd,
      },
    },
    dropPosition,
    handlePaletteSelect,
  };
}
