export enum Piece {
	Pawn = 0b00000001,
	Rook = 0b00000010,
	Bishop = 0b00000100,
	Knight = 0b00001000,
	Queen = 0b00010000,
	King = 0b00100000,
}

export enum Color {
	White = 0b01000000,
	Black = 0b10000000,
}

export type Field = number;
export type Position = number;

export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;
export const COLOR_MASK = 0b11000000;
export const PIECE_MASK = 0b00111111;

export function getKnightMoves(pos: Position): Position[] {
	const [x, y] = splitPosition(pos);
	return [
		[-1, -2],
		[-2, -1],
		[1, -2],
		[-2, 1],
		[-1, 2],
		[2, -1],
		[1, 2],
		[2, 1],
	]
		.map(([dx, dy]) => [dx + x, dy + y])
		.filter(([nx, ny]) => nx >= 0 && nx <= 7 && ny >= 0 && ny <= 7)
		.map(([nx, ny]) => getPosition(nx, ny));
}

export function getKingMoves(pos: Position): Position[] {
	const [x, y] = splitPosition(pos);
	return [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, -1],
		[0, 1],
		[1, -1],
		[1, 0],
		[1, -1],
	]
		.map(([dx, dy]) => [dx + x, dy + y])
		.filter(([nx, ny]) => nx >= 0 && nx <= 7 && ny >= 0 && ny <= 7)
		.map(([nx, ny]) => getPosition(nx, ny));
}

export function getPosition(x: number, y: number) {
	return x + y * BOARD_WIDTH;
}

export function splitPosition(pos: number): [number, number] {
	const y = (pos / BOARD_WIDTH) | 0;
	const x = pos % BOARD_WIDTH;
	return [x, y];
}

// Mask out the non-color bits of the field value
export function GetColor(field: Field): Color {
	return field & COLOR_MASK;
}
