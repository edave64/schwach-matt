import {
	Piece,
	Color,
	type Field,
	type Position,
	splitPosition,
	getPosition,
	PIECE_MASK,
	GetColor,
	getKnightMoves,
	getKingMoves,
} from './generalTerms';
import type { Board } from './board';
import { EncodeMove, MoveType, type Move } from './move';

export function GetBehavior(field: Field): PieceBehavior {
	const masked = field & PIECE_MASK;
	switch (masked) {
		case Piece.Pawn:
			return Pawn;
		case Piece.Rook:
			return Rook;
		case Piece.Knight:
			return Knight;
		case Piece.Bishop:
			return Bishop;
		case Piece.Queen:
			return Queen;
		case Piece.King:
			return King;
	}
	return NonePiece;
}

export const Pawn: PieceBehavior = {
	getAttackedFields(color: Color, pos: Position, board: Board): Move[] {
		const attackAble = [] as Move[];
		const [x, y] = splitPosition(pos);
		const homeRank = color & Color.Black ? 6 : 1;
		const dir = color & Color.Black ? -1 : 1;
		const enemy = color & Color.Black ? Color.White : Color.Black;
		if (y === homeRank && board.getAt(x, y + dir) === 0)
			TestMove(attackAble, pos, getPosition(x, homeRank + dir * 2), board, 0 as Color);
		TestMove(attackAble, pos, getPosition(x, y + dir), board, 0 as Color);
		if (x > 0) TestMove(attackAble, pos, getPosition(x - 1, y + dir), board, enemy);
		if (x < 7) TestMove(attackAble, pos, getPosition(x + 1, y + dir), board, enemy);
		return attackAble;
	},
	getDisplayString: function (color: Color) {
		return color & Color.White ? '♙' : '♟︎';
	},
};

export const Rook: PieceBehavior = {
	getAttackedFields(color, pos, board) {
		const attackAble = [] as Move[];

		ScanInDirection(attackAble, pos, board, -1, 0, color); // Left
		ScanInDirection(attackAble, pos, board, 1, 0, color); // Right
		ScanInDirection(attackAble, pos, board, 0, -1, color); // Up
		ScanInDirection(attackAble, pos, board, 0, 1, color); // Bottom

		return attackAble;
	},
	getDisplayString: function (color: Color) {
		return color & Color.White ? '♖' : '♜';
	},
};

export const Knight: PieceBehavior = {
	getAttackedFields(color, pos, board) {
		color = GetColor(color);
		return getKnightMoves(pos)
			.map((kPos) => {
				const val = board.get(kPos);
				if (val === 0) {
					return EncodeMove(pos, kPos, MoveType.Move);
				} else if (GetColor(val) !== color) {
					return EncodeMove(pos, kPos, MoveType.Capture);
				} else {
					return 0;
				}
			})
			.filter((x) => x !== 0);
	},
	getDisplayString: function (color: Color) {
		return color & Color.White ? '♘' : '♞';
	},
};

export const Bishop: PieceBehavior = {
	getAttackedFields(color, pos, board) {
		const attackAble = [] as Move[];

		ScanInDirection(attackAble, pos, board, -1, -1, color); // Down Left
		ScanInDirection(attackAble, pos, board, -1, 1, color); // Down Right
		ScanInDirection(attackAble, pos, board, 1, -1, color); // Up Left
		ScanInDirection(attackAble, pos, board, 1, 1, color); // Up Right

		return attackAble;
	},
	getDisplayString: function (color: Color) {
		return color & Color.White ? '♗' : '♝';
	},
};

export const Queen: PieceBehavior = {
	getAttackedFields(color, pos, board) {
		const attackAble = [] as Move[];

		ScanInDirection(attackAble, pos, board, -1, 0, color); // Left
		ScanInDirection(attackAble, pos, board, 1, 0, color); // Right
		ScanInDirection(attackAble, pos, board, 0, -1, color); // Up
		ScanInDirection(attackAble, pos, board, 0, 1, color); // Bottom
		ScanInDirection(attackAble, pos, board, -1, -1, color); // Down Left
		ScanInDirection(attackAble, pos, board, -1, 1, color); // Down Right
		ScanInDirection(attackAble, pos, board, 1, -1, color); // Up Left
		ScanInDirection(attackAble, pos, board, 1, 1, color); // Up Right

		return attackAble;
	},
	getDisplayString: function (color: Color) {
		return color & Color.White ? '♕' : '♛';
	},
};

export const King: PieceBehavior = {
	getAttackedFields(color, pos, board) {
		color = GetColor(color);
		return getKingMoves(pos)
			.map((kPos) => {
				const val = board.get(kPos);
				if (val === 0) {
					return EncodeMove(pos, kPos, MoveType.Move);
				} else if (GetColor(val) !== color) {
					return EncodeMove(pos, kPos, MoveType.Capture);
				} else {
					return 0;
				}
			})
			.filter((x) => x !== 0);
	},
	getDisplayString: function (color: Color) {
		return color & Color.White ? '♔' : '♚';
	},
};

export const NonePiece: PieceBehavior = {
	getAttackedFields() {
		return [];
	},
	getDisplayString() {
		return '';
	},
};

export interface PieceBehavior {
	getAttackedFields(color: Color, pos: Position, board: Board): Position[];
	getDisplayString(color: Color): string;
}

function TestMove(moves: Move[], fromPos: Position, toPos: Position, board: Board, color: Color) {
	if (GetColor(board.get(toPos)) === color) {
		moves.push(
			EncodeMove(fromPos, toPos, color === (0 as Color) ? MoveType.Move : MoveType.Capture)
		);
	}
}

function ScanInDirection(
	moves: Move[],
	pos: Position,
	board: Board,
	dx: number,
	dy: number,
	color: Color
) {
	const [x, y] = splitPosition(pos);
	const rColor = GetColor(color);

	let tx = x + dx;
	let ty = y + dy;

	while (tx >= 0 && tx <= 7 && ty >= 0 && ty <= 7) {
		const tPos = getPosition(tx, ty);
		const target = board.get(tPos);
		if (rColor === GetColor(target)) {
			break;
		} else if (target === 0) {
			moves.push(EncodeMove(pos, tPos, MoveType.Move));
		} else {
			moves.push(EncodeMove(pos, tPos, MoveType.Capture));
			break;
		}
		tx += dx;
		ty += dy;
	}
}
