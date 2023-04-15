import { DecodeMove, MoveType, PromotionType, type Move } from './move';
import {
	Piece,
	Color,
	getPosition,
	GetColor,
	PIECE_MASK,
	COLOR_MASK,
	type Position,
	getKnightMoves,
	getKingMoves,
	splitPosition,
	BOARD_WIDTH,
} from './generalTerms';

export class Board {
	public static Default: Board = (() => {
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
		]), null);
	})();

	public static From(state: Uint8Array): Board {
		if (state.length !== 64) throw new Error('Invalid board size');
		const maxField = Piece.King | Color.Black;
		if (state.every((x) => x <= maxField)) throw new Error('Invalid board values');
		// We clone the given state to protect against accidental outside modification after validation.
		return new Board(new Uint8Array(state), 0);
	}

	private constructor(
		private _state: Uint8Array,
		private _enPassant: Position | null,
		private _castlingRights = 0b1111
	) {}

	public get(pos: number): number {
		return this._state[pos];
	}

	public getAt(x: number, y: number): number {
		return this._state[getPosition(x, y)];
	}

	public applyMove(move: Move) {
		const newState = new Uint8Array(this._state);
		const [from, to, type, promotion] = DecodeMove(move);
		const oldVal = newState[from];
		let castleRigts = this._castlingRights;
		let enPassant = 0;
		if (this._enPassant !== to && type === MoveType.Capture) {
			const direction = from - to > 0 ? 1 : -1;
			newState[to + direction * BOARD_WIDTH] = 0;
		}
		if (oldVal & Piece.Rook) {
			const [x, y] = splitPosition(from);
			// Give up casteling rights
			if (oldVal & Color.Black) {
				if (x === 0) {
					castleRigts &= 0b0111;
				}
				if (x === 7) {
					castleRigts &= 0b1011;
				}
			}
			if (oldVal & Color.White) {
				if (x === 0) {
					castleRigts &= 0b1101;
				}
				if (x === 7) {
					castleRigts &= 0b1110;
				}
			}
		}
		if (oldVal & Piece.King) {
			// Give up casteling rights
		}
		if (oldVal & Piece.Pawn && Math.abs(from - to) > BOARD_WIDTH) {
			// A pawn moved more than one row -> enable en passant
			const direction = from - to > 0 ? -1 : 1;
			enPassant = to - direction * BOARD_WIDTH;
		}
		if (type === MoveType.Castle) {
			// Handle the castle
		}
		if (type === MoveType.Promotion) {
			const newPiece =
				GetColor(oldVal) |
				{
					[PromotionType.Queen]: Piece.Queen,
					[PromotionType.Bishop]: Piece.Bishop,
					[PromotionType.Knight]: Piece.Knight,
					[PromotionType.Rook]: Piece.Rook,
				}[promotion];
			newState[to] = newPiece;
			newState[from] = 0;
			return new Board(newState, enPassant, castleRigts);
		}
		newState[to] = newState[from];
		newState[from] = 0;
		return new Board(newState, enPassant, castleRigts);
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
		const enemyDir = myColor === Color.White ? 1 : -1;
		const attackingKnight = enemyColor | Piece.Knight;
		if (getKnightMoves(pos).some((x) => this._state[x] === attackingKnight)) return true;
		const attackingKing = enemyColor | Piece.King;
		if (getKingMoves(pos).some((x) => this._state[x] === attackingKing)) return true;

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

		return (
			this.scanDirForAttack(pos, -1, -1, Piece.Bishop | Piece.Queen, enemyColor) ||
			this.scanDirForAttack(pos, 1, -1, Piece.Bishop | Piece.Queen, enemyColor) ||
			this.scanDirForAttack(pos, -1, 1, Piece.Bishop | Piece.Queen, enemyColor) ||
			this.scanDirForAttack(pos, 1, 1, Piece.Bishop | Piece.Queen, enemyColor) ||
			this.scanDirForAttack(pos, -1, 0, Piece.Rook | Piece.Queen, enemyColor) ||
			this.scanDirForAttack(pos, 1, 0, Piece.Rook | Piece.Queen, enemyColor) ||
			this.scanDirForAttack(pos, 0, -1, Piece.Rook | Piece.Queen, enemyColor) ||
			this.scanDirForAttack(pos, 0, 1, Piece.Rook | Piece.Queen, enemyColor)
		);
	}

	private scanDirForAttack(
		pos: Position,
		dx: number,
		dy: number,
		pieceMatcher: number,
		enemyColor: Color
	): boolean {
		enemyColor = GetColor(enemyColor);
		const [x, y] = splitPosition(pos);

		let tx = x + dx;
		let ty = y + dy;

		while (tx >= 0 && tx <= 7 && ty >= 0 && ty <= 7) {
			const tPos = getPosition(tx, ty);
			const target = this.get(tPos);
			if (target !== 0) {
				return enemyColor === GetColor(target) && (target & pieceMatcher) !== 0;
			}
			tx += dx;
			ty += dy;
		}
		return false;
	}
}
