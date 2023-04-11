<script setup lang="ts">
import { reactive, ref, type Ref } from 'vue';
import { GetBehavior } from '../chess/pieceBehavior.ts';
import {
	Piece,
	Board,
	Color,
	type Position,
	GetColor,
	getPosition,
} from '../chess/generalTerms.ts';

const params = defineProps({
	x: {
		type: Number,
		required: true,
	},
	y: {
		type: Number,
		required: true,
	},
	selected: {
		val: null as null | Position,
		required: true,
	},
	fieldValue: {
		type: Number,
		required: true,
	},
});

const emit = defineEmits(['choose']);

function translateFile(i: number) {
	return String.fromCharCode('a'.charCodeAt(0) + i - 1);
}

function CellString() {
	const piece = GetBehavior(params.fieldValue);
	return piece.getDisplayString(params.fieldValue);
}

function CellClasses() {
	const color = (params.x + params.y) % 2 ? 'light' : 'dark';
	const selectPos = params.selected;
	const pos = getPosition(params.x, params.y);
	const piece = board.get(pos);
	const pieceColor = piece === 0 ? 'empty' : piece & Color.Black ? 'black-piece' : 'white-piece';
	return {
		[color]: true,
		[pieceColor]: true,
		selected: selectPos !== null && selectPos === pos,
	};
}
</script>

<template>
	<div :class="CellClasses()" @click="emit('choose', [x, y])">
		<span>{{ CellString() }}</span>
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

.board .light {
	background-color: var(--board-color-1);
}

.board .dark {
	background-color: var(--board-color-2);
}
</style>
