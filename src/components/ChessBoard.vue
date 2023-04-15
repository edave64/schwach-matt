<script setup lang="ts">
import { computed, ref, type Ref } from 'vue';
import { GetBehavior } from '../chess/pieceBehavior';
import { Board, Color, type Position, GetColor, getPosition } from '../chess/generalTerms';
import { GetTargetPos, type Move } from '@/chess/move';
import BoardCell from '@/components/BoardCell.vue';

const board = ref(Board.Default) as Ref<Board>;

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

const checkmate = computed(() => {
	return Object.keys(allAvailableMoves.value).length === 0;
});

const availableMoves = computed(() => {
	const sel = selected.value;
	if (sel === null) return [];
	return allAvailableMoves.value[sel] ?? [];
});

function CellClick([x, y]: [number, number]) {
	if (checkmate.value) return;
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
</script>

<template>
	<p class="info" v-if="!checkmate">
		{{ turnPlayer === Color.White ? 'White' : 'Black' }} to move
	</p>
	<div class="board">
		<template v-for="rankInv in 8">
			<template v-for="file in 8" :key="`${rankInv}_${file}`">
				<board-cell
					:x="file - 1"
					:y="8 - rankInv"
					:selected="selected"
					:board="board"
					:availableMoves="availableMoves"
					@choose="CellClick"
				/>
			</template>
		</template>
		<div class="checkmate" v-if="checkmate">
			<h2>Checkmate</h2>
			<p>{{ turnPlayer === Color.White ? 'Black' : 'White' }} has won.</p>
		</div>
	</div>
</template>

<style scoped>
.board {
	position: relative;
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

p.info {
	color: white;
	position: absolute;
	top: 0;
	left: 0;
}

.checkmate {
	background: rgba(0, 0, 0, 0.5);
	color: red;
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.checkmate * {
	filter: drop-shadow(0px 0px 4px #000);
}
</style>
