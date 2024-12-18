/**
 * SVG 도형을 그리기 위한 path 데이터 문자열
 *
 * M: 시작점 이동 (Move to)
 * Q: 베지어 곡선 (Quadratic Bezier curve)
 * Z: 경로 닫기 (Close path)
 *
 * 값 형식: x y 좌표 (0~100 범위의 상대값)
 */

export const circle = `
  M 50 0
  Q 85 0, 92.5 25
  Q 110 50, 92.5 75
  Q 85 100, 50 100
  Q 15 100, 7.5 75
  Q -10 50, 7.5 25
  Q 15 0, 50 0
  Z
`;

export const hexagon = `
  M 50 0 
  Q 71.65 12.5, 93.3 25 
  Q 93.3 50, 93.3 75 
  Q 71.65 87.5, 50 100 
  Q 28.35 87.5, 6.7 75 
  Q 6.7 50, 6.7 25 
  Q 28.35 12.5, 50 0 
  Z
`;
