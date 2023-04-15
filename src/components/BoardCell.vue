<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { GetBehavior } from '../chess/pieceBehavior';
import { Color, type Position, getPosition } from '../chess/generalTerms';
import { GetTargetPos, type Move } from '@/chess/move';
import type { Board } from '@/chess/board';

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
	board: {
		type: Object as PropType<Board>,
		required: true,
	},
	availableMoves: {
		type: Array as PropType<Move[]>,
		required: true,
	},
});

const emit = defineEmits(['choose']);

const pos = computed(() => getPosition(params.x, params.y));

function CellString() {
	const val = params.board.get(pos.value);
	return GetBehavior(val).getDisplayString(val);
}

function CellClasses() {
	const color = (params.x + params.y) % 2 ? 'light' : 'dark';
	const selectPos = params.selected;
	const pos = getPosition(params.x, params.y);
	const piece = params.board.get(pos);
	const pieceColor = piece === 0 ? 'empty' : piece & Color.Black ? 'black-piece' : 'white-piece';

	const attacked = params.availableMoves.some((x) => GetTargetPos(x) === pos);

	return {
		[color]: true,
		[pieceColor]: true,
		selected: selectPos !== null && selectPos === pos,
		attacked,
	};
}
</script>

<template>
	<div :class="CellClasses()" @click="emit('choose', [x, y])">
		<span>{{ CellString() }}</span>
	</div>
</template>

<style scoped>
div {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	user-select: none;
	-webkit-user-select: none;
}

div:not(.empty) {
	cursor: grab;
}

div span {
	user-select: none;
	-webkit-user-select: none;
}

.white-piece span {
	filter: drop-shadow(0px 0px 2px #000);
	color: #fff;
}

.black-piece span {
	filter: drop-shadow(0px 0px 2px #fff);
	color: #000;
}

.selected {
	background: green;
}

.attacked::before {
	position: absolute;
	content: '🔴';
	user-select: none;
	-webkit-user-select: none;
}

.attacked.empty::before {
	content: '🟡';
}

.light {
	background-color: var(--board-color-1);
}

.dark {
	background-color: var(--board-color-2);
}
</style>
