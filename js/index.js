import { renderPokemon } from "./functions.js";

const debounce = (func, delay) => {
	let debounceTimer;
	return function () {
		const context = this;
		const args = arguments;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => func.apply(context, args), delay);
	};
};

(async () => {
	const id = new URLSearchParams(window.location.search).get("id");
	const searchForm = document.querySelector("#search-form");
	const searchBar = document.querySelector("#search");
	const pokemonContainer = document.querySelector("#pokemon-container");
	if (id) {
		renderPokemon(id, pokemonContainer);
	} else {
		renderPokemon(1, pokemonContainer);
	}
	searchBar.addEventListener(
		"keyup",
		debounce(() => {
			// submit search form
			searchForm.submit();
		}, 500)
	);
})();
