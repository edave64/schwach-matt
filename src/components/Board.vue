<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue';
import { GetBehavior } from '../chess/pieceBehavior';
import { Board, Color, type Position, GetColor, getPosition } from '../chess/generalTerms';
import { GetTargetPos, type Move } from '@/chess/move';

const board = ref(Board.Default);

const turnPlayer = ref(Color.White);

const selected: Ref<null | Position> = ref(null);

const allAvailableMoves = computed(() => {
	const obj: { [pos: number]: Move[] } = {};
	const b = board.value as Board;
	const activePlayer = turnPlayer.value;
	for (let i = 0; i < 64; ++i) {
		const val = b.get(i);
		if (val === 0 || GetColor(val) !== activePlayer) continue;
		const attacks = GetBehavior(val)
			.getAttackedFields(val, i, b)
			.filter((x: Move) => !b.applyMove(x).isCheck(turnPlayer.value));
		if (attacks.length === 0) continue;
		obj[i] = attacks;
	}
	return obj;
});

watch(allAvailableMoves, (moves) => {
	console.log(moves);
	if (Object.keys(moves).length === 0) {
		console.log('Checkmate!');
	}
});

const availableMoves = computed(() => {
	const sel = selected.value;
	if (sel === null) return [];
	return allAvailableMoves.value[sel] ?? [];
});

function CellString(x: number, y: number) {
	const field = board.value.getAt(x, y);
	const piece = GetBehavior(field);
	return piece.getDisplayString(field);
}

function CellClasses(x: number, y: number) {
	const color = (x + y) % 2 ? 'light' : 'dark';
	const selectPos = selected.value;
	const pos = getPosition(x, y);
	const piece = board.value.get(pos);
	const pieceColor = piece === 0 ? 'empty' : piece & Color.Black ? 'black-piece' : 'white-piece';

	const attacked = availableMoves.value.some((x) => GetTargetPos(x) === pos);

	return {
		[color]: true,
		[pieceColor]: true,
		selected: selectPos !== null && selectPos === pos,
		attacked,
	};
}

function CellClick(x: number, y: number) {
	const oldPos = selected.value;
	const pos = getPosition(x, y);
	if (oldPos !== null) {
		const oldPiece = board.value.get(oldPos);
		const newPiece = board.value.get(pos);
		if (GetColor(oldPiece) === GetColor(newPiece)) {
			selected.value = pos;
		} else {
			const availableMove = availableMoves.value.find((x) => GetTargetPos(x) === pos);
			if (availableMove) {
				ApplyTurn(availableMove);
			}
		}
	} else {
		if (GetColor(board.value.get(pos)) === turnPlayer.value) {
			selected.value = pos;
		}
	}
}

function ApplyTurn(move: Move) {
	board.value = board.value.applyMove(move);
	selected.value = null;
	if (turnPlayer.value === Color.White) {
		turnPlayer.value = Color.Black;
	} else {
		turnPlayer.value = Color.White;
	}
}

function TestCheckmate() {}
</script>

<template>
	<p>{{ turnPlayer === Color.White ? 'White' : 'Black' }} to move</p>
	<div class="board">
		<template v-for="rankInv in 8">
			<template v-for="file in 8" :key="`${rankInv}_${file}`">
				<div
					:class="CellClasses(file - 1, 8 - rankInv)"
					@click="CellClick(file - 1, 8 - rankInv)"
				>
					<span>{{ CellString(file - 1, 8 - rankInv) }}</span>
				</div>
			</template>
		</template>
	</div>
</template>

<style scoped>
.board {
	width: 90vmin; /* Set the width to 50% of the viewport width */
	height: 90vmin; /* Set the height to 50% of the viewport width */
	max-width: 90vh; /* Set the maximum width to 90% of the viewport height */
	max-height: 90vh; /* Set the maximum height to 90% of the viewport height */
	font-size: 5vmin;
	background-color: #ccc; /* Set a background color for the square */
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
	gap: 0px 0px;
	max-height: 100%;
	--board-color-1: rgb(237, 238, 209);
	--board-color-2: rgb(119, 153, 82);

	box-shadow: 0px 0px 16px 4px gray;
}

p {
	color: white;
	position: absolute;
	top: 0;
	left: 0;
}

.board div {
	display: flex;
	align-items: center;
	justify-content: center;
	user-select: none;
	-webkit-user-select: none;
}

.board div.white-piece span {
	filter: drop-shadow(0px 0px 2px #000);
	color: #fff;
}

.board div.black-piece span {
	filter: drop-shadow(0px 0px 2px #fff);
	color: #000;
}

.board div.selected {
	background: green;
}

.board div.attacked {
	background: black;
}

.board .light {
	background-color: var(--board-color-1);
}

.board .dark {
	background-color: var(--board-color-2);
}
</style>
