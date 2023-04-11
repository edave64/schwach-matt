<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue';
import BoardVue from '../components/Board.vue';
</script>

<template>
	<main>
		<BoardVue />
	</main>
</template>

<style>
main {
	display: flex;
	min-height: 100vh;
	justify-content: center;
	align-items: center;
}
</style>
