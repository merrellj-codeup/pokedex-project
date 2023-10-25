import { renderPokemon } from "./functions.js";

(async () => {
	const id = new URLSearchParams(window.location.search).get("id");
	const pokemonContainer = document.querySelector("#pokemon-container");
	if (id) {
		const pokemonName = await renderPokemon(id, pokemonContainer);
	} else {
		renderPokemon(1, pokemonContainer);
	}
})();
