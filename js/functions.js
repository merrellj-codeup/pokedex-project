export const getStat = (stats, targetName) => {
	const result = stats.reduce((acc, statistic) => {
		if (statistic.stat.name === targetName) {
			acc = statistic.base_stat;
		} else {
			acc = acc;
		}
		return acc;
	}, "");
	return result;
};
export const getMoreInfo = async (url) => {
	const options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	const response = await fetch(url, options);
	const data = await response.json();
	return data;
};
export const getFlavoredText = (arr) => {
	const result = arr.reduce((acc, flavor) => {
		if (flavor.language?.name === "en" && flavor.flavor_text?.length > acc.length) {
			acc = flavor.flavor_text;
		} else {
			return acc;
		}
		return acc;
	}, " ");
	return result;
};
export const getEvolutionChain = async (chainUrl) => {
	const options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};

	let evolutionArray = [];
	// get the chain info from the api
	const response = await fetch(chainUrl, options);
	let data = await response.json();
	// get the first pokemon in the chain
	const firstPokemon = await getPokemon(data.chain.species.name);
	evolutionArray.push(firstPokemon);

	let evolves_to = data.chain.evolves_to;
	// get the first pokemon in the chain if there is one
	while (evolves_to?.length > 0) {
		const pokemon = await getPokemon(evolves_to[0].species.name);
		evolutionArray.push(pokemon);
		if (evolves_to[0].evolves_to.length > 0) {
			evolves_to = evolves_to[0].evolves_to;
		} else {
			evolves_to = null;
		}
	}
	return evolutionArray;
};
export const getWeakness = (type) => {
	const weaknessLookup = {
		fire: ["water", "ground", "rock"],
		water: ["electric", "grass"],
		grass: ["fire", "ice", "poison", "flying", "bug"],
		electric: ["ground"],
		normal: ["fighting"],
		fighting: ["flying", "psychic", "fairy"],
		flying: ["electric", "ice", "rock"],
		poison: ["ground", "psychic"],
		ground: ["water", "grass", "ice"],
		psychic: ["bug", "ghost", "dark"],
		rock: ["water", "grass", "fighting", "ground", "steel"],
		ice: ["fire", "fighting", "rock", "steel"],
		bug: ["fire", "flying", "rock"],
		dragon: ["ice", "dragon", "fairy"],
		ghost: ["ghost", "dark"],
		dark: ["fighting", "bug", "fairy"],
		steel: ["fire", "fighting", "ground"],
		fairy: ["poison", "steel"],
	};
	return weaknessLookup[type];
};
export const getWeaknesses = (types) => {
	let weaknesses = [];
	types.forEach((type) => {
		weaknesses = [...weaknesses, ...getWeakness(type.type.name)];
	});
	weaknesses = [...new Set(weaknesses)];
	return weaknesses;
};
export const renderWeaknesses = (types) => {
	const weaknesses = getWeaknesses(types);
	const html = weaknesses
		.map((weakness) => {
			const elementTag = document.createElement("div");
			elementTag.classList.add("element-tag", weakness);
			elementTag.textContent = weakness;
			return elementTag.outerHTML;
		})
		.join("");
	return html;
};
export const getPokemon = async (id) => {
	const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
	const options = {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	};
	const response = await fetch(url, options);
	const data = await response.json();
	return data;
};
export const renderPokemon = async (id, target) => {
	let pokemon = await getPokemon(id);
	const species = await getMoreInfo(pokemon.species.url);
	const evolutionChain = await getEvolutionChain(species.evolution_chain.url);
	pokemon = {
		...pokemon,
		species,
		evolutionChain,
	};
	const html = document.createDocumentFragment();
	const leftColumn = document.createElement("div");
	leftColumn.classList.add("column", "gap-10", "slide-in-left");
	leftColumn.innerHTML = `
        <div class="d-flex gap-5">
            <h1>${pokemon.name}</h1>
            <span class="pokeid">#0${pokemon.id}</span>
        </div>
        <div class="d-flex gap-10 flex-wrap">
            ${pokemon.types
				.map((type) => {
					return `<div class="element-tag ${type.type.name}">${type.type.name}</div>`;
				})
				.join("")}
        </div>
        <div class="d-flex flex-grow-1 align-items-center pokemon-pic-wrapper ${pokemon.types[0].type.name}">
            <img src="${pokemon.sprites.other["official-artwork"].front_default}"
                alt="pokemon" class="pokemon-pic">
        </div>
        <h2>Evolutions</h2>
        <div class="d-flex justify-content-between position-relative flex-wrap">
            <div class="evolution-line ${pokemon.types[0].type.name}"></div>
            ${pokemon.evolutionChain
				.map((pokemon) => {
					let html = `
                    <div class="evolution align-items-center">
                        <div class="evo-avatar-wrapper ${pokemon.types[0].type.name}">
                            <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="pokemon" class="evo-avatar">
                        </div>
                        <div class="d-flex gap-10 align-items-center justify-content-center">
                            <h3>${pokemon.name}</h3>
                            <span class="pokeid">#0${parseInt(pokemon.id)}</span>
                        </div>
                        <div class="d-flex gap-10 flex-wrap justify-content-center">
                        <div class="element-tag ${pokemon.types[0].type.name}">${pokemon.types[0].type.name}</div>
                        </div>
                    </div>
                `;
					return html;
				})
				.join("")}
        </div>
    `;
	html.appendChild(leftColumn);
	const rightColumn = document.createElement("div");
	rightColumn.classList.add("column", "slide-in-right");
	rightColumn.innerHTML = `
        <div class="tabs">
            <div class="tabs-menu">
                <div class="tabs-menu-item active">About</div>
                <div class="tabs-menu-item">Moves</div>
            </div>
            <div class="tabs-content">
                <div class="tabs-pane active">
                    <div class="d-flex flex-column gap-10">
                        <h2>Weaknesses</h2>
                        <div class="d-flex gap-10 align-items-center flex-wrap py-10">
                            ${renderWeaknesses(pokemon.types)}
                        </div>
                    </div>
                    <div class="d-flex flex-column gap-10">
                        <h2>Story</h2>
                        <p>${getFlavoredText(pokemon.species.flavor_text_entries)}</p>
                    </div>
                    <div class="d-flex flex-wrap gap-10 align-items-start justify-content-start">
                        <div class="stat-box">
                            <div class="stat-box-title">Height</div>
                            <div class="stat-box-value">${pokemon.height}m</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-box-title">Weight</div>
                            <div class="stat-box-value">${pokemon.weight}kg</div>
                        </div>
                    </div>
                    <div class="d-flex flex-column gap-10">
                        <h2>Stats</h2>
                        <table class="stats-table">
                            <tr>
                                <td>HP</td>
                                <td>${getStat(pokemon.stats, "hp")}</td>
                                <td>
                                    <meter value="${getStat(pokemon.stats, "hp")}" min="0" max="100"></meter>
                                </td>
                            </tr>
                            <tr>
                                <td>Attack</td>
                                <td>${getStat(pokemon.stats, "attack")}</td>
                                <td>
                                    <meter value="${getStat(pokemon.stats, "attack")}" min="0" max="100"></meter>
                                </td>
                            </tr>
                            <tr>
                                <td>Defense</td>
                                <td>${getStat(pokemon.stats, "defense")}</td>
                                <td>
                                    <meter value="${getStat(pokemon.stats, "defense")}" min="0" max="100"></meter>
                                </td>
                            </tr>
                            <tr>
                                <td>Sp. Attack</td>
                                <td>${getStat(pokemon.stats, "special-attack")}</td>
                                <td>
                                    <meter value="${getStat(pokemon.stats, "special-attack")}" min="0" max="100"></meter>
                                </td>
                            </tr>
                            <tr>
                                <td>Sp. Defense</td>
                                <td>${getStat(pokemon.stats, "special-defense")}</td>
                                <td>
                                    <meter value="${getStat(pokemon.stats, "special-defense")}" min="0" max="100"></meter>
                                </td>
                            </tr>
                            <tr>
                                <td>Speed</td>
                                <td>${getStat(pokemon.stats, "speed")}</td>
                                <td>
                                    <meter value="${getStat(pokemon.stats, "speed")}" min="0" max="100"></meter>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
	html.appendChild(rightColumn);
	target.innerHTML = "";
	target.appendChild(html);
	renderArrows(pokemon.id, target);
};
export const renderArrows = (id, target) => {
	const rightArrow = document.createElement("a");
	rightArrow.classList.add("arrow-container", "right");
	const nextId = parseFloat(id) === 1017 ? 1 : parseFloat(id) + 1;
	rightArrow.href = `?id=${nextId}`;
	rightArrow.innerHTML = `
        <h2>Next</h2>
        <svg width="30" viewBox="0 0 1200 1200">
            <g>
                <path d="m1020 420h-120v120h-120v-120h-720v240h840v120h120v-120h120v-120h-120z" />
                <path d="m780 300h120v120h-120z" />
                <path d="m660 180h120v120h-120z" />
                <path d="m780 780h120v120h-120z" />
                <path d="m660 900h120v120h-120z" />
            </g>
        </svg>
    `;
	target.appendChild(rightArrow);
	const leftArrow = document.createElement("a");
	leftArrow.classList.add("arrow-container", "left");
	const prevId = parseFloat(id) === 1 ? 1017 : parseFloat(id) - 1;
	leftArrow.href = `?id=${prevId}`;
	leftArrow.innerHTML = `
        <svg width="30" viewBox="0 0 1200 1200">
            <g>
                <path d="m900 420h-480v120h-120v-120h-120v120h-120v120h120v120h120v-120h840v-240z" />
                <path d="m300 300h120v120h-120z" />
                <path d="m420 180h120v120h-120z" />
                <path d="m300 780h120v120h-120z" />
                <path d="m420 900h120v120h-120z" />
            </g>
        </svg>
        <h2>Prev</h2>
    `;
	target.appendChild(leftArrow);
	document.addEventListener("keydown", (e) => {
		if (e.key === "ArrowRight") {
			rightArrow.click();
		} else if (e.key === "ArrowLeft") {
			leftArrow.click();
		}
	});
};
