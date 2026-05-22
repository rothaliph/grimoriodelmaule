const FT_TO_M = 0.3048;

const toMeters = feet => feet * FT_TO_M;
const toFeet = meters => meters / FT_TO_M;
const formatNum = value => value.toFixed(2);

const getSanitizedAbilityScore = rawValue => {
	const parsed = Number(rawValue);
	if (Number.isNaN(parsed)) return 1;
	return Math.max(1, Math.min(30, Math.floor(parsed)));
};

const getSanitizedLength = rawValue => {
	const parsed = Number(rawValue);
	if (Number.isNaN(parsed)) return 0;
	return Math.max(0, parsed);
};

const setText = (id, value) => {
	document.getElementById(id).textContent = formatNum(value);
};

const setLongObstacleNote = ({obstacleFt, maxLowObstacleFt}) => {
	const $note = document.getElementById("out-long-obstacle-note");

	if (!obstacleFt) {
		$note.textContent = "No hay obstáculo configurado.";
		return;
	}

	if (obstacleFt <= maxLowObstacleFt) {
		$note.textContent = "Obstáculo bajo válido: a discreción del DM, requiere prueba de Fuerza (Atletismo) CD 10 para superarlo.";
		return;
	}

	$note.textContent = "El obstáculo supera 1/4 del salto con carrera; esta regla concreta de obstáculo bajo no aplicaría directamente.";
};

const setLongDifficultTerrainNote = () => {
	const isDifficultTerrain = document.getElementById("cb-long-difficult").checked;
	const $note = document.getElementById("out-long-difficult-note");

	if (!isDifficultTerrain) {
		$note.textContent = "No hay terreno difícil marcado.";
		return;
	}

	$note.textContent = "Terreno difícil marcado: debes superar Destreza (Acrobacias) CD 10 o quedas Tumbado.";
};

const updateLongJump = () => {
	const strScore = getSanitizedAbilityScore(document.getElementById("ipt-long-str").value);
	const obstacleUnit = document.getElementById("sel-long-obstacle-unit").value;
	const rawObstacle = getSanitizedLength(document.getElementById("ipt-long-obstacle").value);
	const obstacleFt = obstacleUnit === "m" ? toFeet(rawObstacle) : rawObstacle;

	const distanceRunFt = strScore;
	const distanceStandFt = distanceRunFt / 2;
	const maxLowObstacleFt = distanceRunFt / 4;

	setText("out-long-run-ft", distanceRunFt);
	setText("out-long-run-m", toMeters(distanceRunFt));
	setText("out-long-stand-ft", distanceStandFt);
	setText("out-long-stand-m", toMeters(distanceStandFt));
	setText("out-long-cost-ft", distanceRunFt);
	setText("out-long-cost-m", toMeters(distanceRunFt));
	setText("out-long-obstacle-max-ft", maxLowObstacleFt);
	setText("out-long-obstacle-max-m", toMeters(maxLowObstacleFt));

	setLongObstacleNote({obstacleFt, maxLowObstacleFt});
	setLongDifficultTerrainNote();
};

const updateHighJump = () => {
	const strScore = getSanitizedAbilityScore(document.getElementById("ipt-high-str").value);
	const heightUnit = document.getElementById("sel-high-height-unit").value;
	const rawHeight = getSanitizedLength(document.getElementById("ipt-high-height").value);

	const characterHeightFt = heightUnit === "m" ? toFeet(rawHeight) : rawHeight;

	const strMod = Math.floor((strScore - 10) / 2);
	const jumpRunFt = Math.max(0, 3 + strMod);
	const jumpStandFt = jumpRunFt / 2;
	const armExtensionFt = characterHeightFt / 2;
	const baseReachFt = characterHeightFt + armExtensionFt;
	const totalReachRunFt = baseReachFt + jumpRunFt;
	const totalReachStandFt = baseReachFt + jumpStandFt;

	setText("out-high-run-ft", jumpRunFt);
	setText("out-high-run-m", toMeters(jumpRunFt));
	setText("out-high-stand-ft", jumpStandFt);
	setText("out-high-stand-m", toMeters(jumpStandFt));
	setText("out-high-cost-ft", jumpRunFt);
	setText("out-high-cost-m", toMeters(jumpRunFt));
	setText("out-reach-run-ft", totalReachRunFt);
	setText("out-reach-run-m", toMeters(totalReachRunFt));
	setText("out-reach-stand-ft", totalReachStandFt);
	setText("out-reach-stand-m", toMeters(totalReachStandFt));
};

const getSizeCategory = heightFt => {
	if (heightFt < 4) return "Tiny";
	if (heightFt < 6) return "Small";
	if (heightFt < 8) return "Medium";
	if (heightFt < 16) return "Large";
	if (heightFt < 32) return "Huge";
	return "Gargantuan";
};

const updateSizeHeight = () => {
	const heightUnit = document.getElementById("sel-size-height-unit").value;
	const rawHeight = getSanitizedLength(document.getElementById("ipt-size-height").value);
	const heightFt = heightUnit === "m" ? toFeet(rawHeight) : rawHeight;

	setText("out-size-height-ft", heightFt);
	setText("out-size-height-m", toMeters(heightFt));

	const size = getSizeCategory(heightFt);
	document.getElementById("out-size-category-note").textContent = `Tamaño sugerido por altura: ${size}.`;
};

window.addEventListener("load", () => {
	[
		"ipt-long-str",
		"ipt-long-obstacle",
		"sel-long-obstacle-unit",
		"cb-long-difficult",
		"ipt-high-str",
		"sel-high-height-unit",
		"ipt-high-height",
		"ipt-size-height",
		"sel-size-height-unit",
	].forEach(id => {
		document.getElementById(id).addEventListener("input", () => {
			updateLongJump();
			updateHighJump();
			updateSizeHeight();
		});
	});

	updateLongJump();
	updateHighJump();
	updateSizeHeight();

	window.dispatchEvent(new Event("toolsLoaded"));
});
