import { DecodeMove, type Move } from './move';

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

export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;
export const COLOR_MASK = 0b11000000;
export const PIECE_MASK = 0b00111111;

export class Board {
	public static Default = (() => {
		const p = Piece.Pawn;
		const r = Piece.Rook;
		const k = Piece.Knight;
		const b = Piece.Bishop;
		const x = Piece.King;
		const q = Piece.Queen;

		// prettier-ignore
		return new Board(new Uint8Array([
            ...[r, k, b, q, x, b, k, r].map((x) => x | Color.White),
            ...[p, p, p, p, p, p, p, p].map((x) => x | Color.White),
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
            ...[p, p, p, p, p, p, p, p].map((x) => x | Color.Black),
            ...[r, k, b, q, x, b, k, r].map((x) => x | Color.Black),
        ]));
	})();

	public static From(state: Uint8Array): Board {
		if (state.length !== 64) throw new Error('Invalid board size');
		const maxField = Piece.King | Color.Black;
		if (state.every((x) => x <= maxField)) throw new Error('Invalid board values');
		// We clone the given state to protect against accidental outside modification after validation.
		return new Board(new Uint8Array(state));
	}

	private constructor(private _state: Uint8Array) {}

	public get(pos: number): number {
		return this._state[pos];
	}

	public getAt(x: number, y: number): number {
		return this._state[getPosition(x, y)];
	}

	public applyMove(move: Move) {
		const newState = new Uint8Array(this._state);
		const [from, to, type, promotion] = DecodeMove(move);
		newState[to] = newState[from];
		newState[from] = 0;
		return new Board(newState);
	}

	public isCheck(color: Color): boolean {
		const kingMatcher = GetColor(color) | Piece.King;
		const kingMask = PIECE_MASK | COLOR_MASK;
		const kingPos = this._state.findIndex((piece) => (piece & kingMask) === kingMatcher);
		if (kingPos < -1) {
			// Invalid board state. But I guess technically the king can't be in check if it doesn't exist?
			return false;
		}
		return this.isUnderAttack(kingPos, color);
	}

	public isUnderAttack(pos: Position, myColor: Color): boolean {
		myColor = GetColor(myColor);
		// The direction the enemy pawns will come from.
		const enemyColor = myColor === Color.White ? Color.Black : Color.White;
		const enemyDir = myColor === Color.White ? -1 : 1;
		const attackingKnight = enemyColor | Piece.Knight;
		if (getKnightMoves(pos).some((x) => this._state[x] === attackingKnight)) return true;

		// Our system encoding makes checking for any amount of pieces equally fast, so it use that as an early exit
		// for close attacking queens and bishops, too.
		const attackingPawn = enemyColor | Piece.Pawn | Piece.Queen | Piece.Bishop;
		const [x, y] = splitPosition(pos);
		if (
			x > 0 &&
			GetColor(this._state[getPosition(x - 1, y + enemyDir)] & attackingPawn) === enemyColor
		)
			return true;
		if (
			x < 7 &&
			GetColor(this._state[getPosition(x + 1, y + enemyDir)] & attackingPawn) === enemyColor
		)
			return true;

		return this.scanDirForAttack(
			pos,
			-1,
			-1,
			Piece.Bishop | Piece.Queen | enemyColor,
			enemyColor
		);
	}

	private scanDirForAttack(
		pos: Position,
		dx: number,
		dy: number,
		pieceMatcher: number,
		enemyColor: Color
	): boolean {
		return true;
	}
}

function getKnightMoves(pos: Position): Position[] {
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

export function getPosition(x: number, y: number) {
	return x + y * BOARD_WIDTH;
}

export function splitPosition(pos: number): [number, number] {
	const y = (pos / BOARD_WIDTH) | 0;
	const x = pos % BOARD_WIDTH;
	return [x, y];
}

export type Position = number;

// Mask out the non-color bits of the field value
export function GetColor(field: Field): Color {
	return field & COLOR_MASK;
}
