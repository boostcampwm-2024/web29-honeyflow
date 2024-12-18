import { createContext, useContext } from "react";

import { type ClassValue, clsx } from "clsx";
import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { Node } from "shared/types";
import { twMerge } from "tailwind-merge";

export default {};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type getDistanceFromPoints = (
  firstPoint: Vector2d | null,
  secondPoint: Vector2d | null,
) => number;

export const getDistanceFromPoints: getDistanceFromPoints = (
  firstPoint,
  secondPoint,
) => {
  if (!firstPoint || !secondPoint) {
    return 0;
  }

  const dx = secondPoint.x - firstPoint.x;
  const dy = secondPoint.y - firstPoint.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance;
};

type findOverlapNodes = (dragPosition: Vector2d, nodes: Node[]) => Node[];

export const findOverlapNodes: findOverlapNodes = (dragPosition, nodes) => {
  const overlapNodes = nodes.filter((node) => {
    const isIntersects = Konva.Util.haveIntersection(
      {
        x: dragPosition.x,
        y: dragPosition.y,
        width: 64 * 2,
        height: 64 * 2,
      },
      {
        x: node.x,
        y: node.y,
        width: 64 * 2,
        height: 64 * 2,
      },
    );

    return isIntersects;
  });

  return overlapNodes;
};

type findNearestNode = (position: Vector2d, overlapNodes: Node[]) => Node;

export const findNearestNode: findNearestNode = (position, overlapNodes) => {
  if (overlapNodes.length === 1) return overlapNodes[0];

  const sortedNodes = overlapNodes.sort((a, b) => {
    return (
      getDistanceFromPoints({ x: a.x, y: a.y }, position) -
      getDistanceFromPoints({ x: b.x, y: b.y }, position)
    );
  });

  return sortedNodes[0];
};

export function createSafeContext<T>(defaultValue?: T) {
  const MyContext = createContext<T | undefined>(defaultValue);

  function useMyContext() {
    const context = useContext(MyContext);

    if (context === undefined) {
      throw new Error("Provider 없음");
    }

    return context;
  }

  return [useMyContext, MyContext.Provider] as const;
}

export function generateUniqueId() {
  return Math.random().toString(36).slice(2);
}

// 노출과 명도는 유지, 색상만 랜덤
export function generateUserColor(clientId: number = Math.random() * 999999) {
  const hue = clientId % 360;
  return `hsl(${hue}, 80%, 50%)`;
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
) {
  let timer: null | number = null;

  return function throttledCallback(
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ) {
    if (timer) {
      return;
    }

    timer = window.setTimeout(() => {
      callback.apply(this, args);
      timer = null;
    }, delay);
  };
}

export async function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  // polyfill
  const span = document.createElement("span");
  span.textContent = text;

  span.style.whiteSpace = "pre";
  span.style.webkitUserSelect = "auto";
  span.style.userSelect = "all";

  document.body.appendChild(span);

  const selection = window.getSelection();
  const range = window.document.createRange();

  selection?.removeAllRanges();
  range.selectNode(span);
  selection?.addRange(range);

  let isSuccessful = false;

  try {
    isSuccessful = document.execCommand("copy");
  } finally {
    document.body.removeChild(span);
  }

  if (!isSuccessful) {
    return Promise.reject(new Error("복사에 실패했습니다"));
  }

  return Promise.resolve();
}
