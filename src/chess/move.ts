import type { Position } from './generalTerms';

export enum MoveType {
	Move = 0b0001,
	Capture = 0b0010,
	Promotion = 0b0100,
	Castle = 0b1000,
}

export enum PromotionType {
	None = 0,
	Queen = 0b0001 << 4,
	Rook = 0b0010 << 4,
	Bishop = 0b0100 << 4,
	Knight = 0b1000 << 4,
}

export type Move = number;

/**
 * Encodes a move to a single 32-bit number
 */
export function EncodeMove(
	posFrom: Position,
	posTo: Position,
	type: MoveType,
	promotion: PromotionType = PromotionType.None
): Move {
	if (type !== MoveType.Promotion && promotion !== PromotionType.None)
		throw new Error('Cannot encode a promotion type without an promotion taking place');
	if (posFrom >= 64) throw new Error('Cannot encode move: Invalid source position');
	if (posTo >= 64) throw new Error('Cannot encode move: Invalid target position');
	return (posFrom << 24) | (posTo << 16) | promotion | type;
}

export function GetSourcePos(code: Move): Position {
	return (code & 0xff000000) >> 24;
}

export function GetTargetPos(code: Move): Position {
	return (code & 0x00ff0000) >> 16;
}

export function DecodeMove(code: Move): [Position, Position, MoveType, PromotionType] {
	const moveType = code & 0x0000000f;
	const promotionType = code & 0x000000f0;
	return [GetSourcePos(code), GetTargetPos(code), moveType, promotionType];
}
