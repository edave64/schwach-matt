<script setup lang="ts">
import { computed, type PropType } from 'vue';
import { GetBehavior } from '../chess/pieceBehavior';
import { Board, Color, type Position, getPosition } from '../chess/generalTerms';
import { GetTargetPos, type Move } from '@/chess/move';

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

function translateFile(i: number) {
	return String.fromCharCode('a'.charCodeAt(0) + i - 1);
}

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
	display: flex;
	align-items: center;
	justify-content: center;
	user-select: none;
	-webkit-user-select: none;
}

div.white-piece span {
	filter: drop-shadow(0px 0px 2px #000);
	color: #fff;
}

div.black-piece span {
	filter: drop-shadow(0px 0px 2px #fff);
	color: #000;
}

div.selected {
	background: green;
}

div.attacked {
	background: black;
}

.light {
	background-color: var(--board-color-1);
}

.dark {
	background-color: var(--board-color-2);
}
</style>
