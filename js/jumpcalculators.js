const FT_TO_M = 0.3048;

const toMeters = (feet) => feet * FT_TO_M;
const toFeet = (meters) => meters / FT_TO_M;
const formatNum = (value) => value.toFixed(2);

const getSanitizedAbilityScore = (rawValue) => {
	const parsed = Number(rawValue);
	if (Number.isNaN(parsed)) return 1;
	return Math.max(1, Math.min(30, Math.floor(parsed)));
};

const getSanitizedLength = (rawValue) => {
	const parsed = Number(rawValue);
	if (Number.isNaN(parsed)) return 0;
	return Math.max(0, parsed);
};

const setText = (id, value) => {
	document.getElementById(id).textContent = formatNum(value);
};

const updateLongJump = () => {
	const strScore = getSanitizedAbilityScore(document.getElementById("ipt-long-str").value);

	const distanceRunFt = strScore;
	const distanceStandFt = distanceRunFt / 2;
	const diffFt = distanceRunFt - distanceStandFt;

	setText("out-long-run-ft", distanceRunFt);
	setText("out-long-run-m", toMeters(distanceRunFt));
	setText("out-long-stand-ft", distanceStandFt);
	setText("out-long-stand-m", toMeters(distanceStandFt));
	setText("out-long-diff-ft", diffFt);
	setText("out-long-diff-m", toMeters(diffFt));
};

const updateHighJump = () => {
	const strScore = getSanitizedAbilityScore(document.getElementById("ipt-high-str").value);
	const unit = document.getElementById("sel-unit").value;
	const rawHeight = getSanitizedLength(document.getElementById("ipt-height").value);
	const rawOffset = getSanitizedLength(document.getElementById("ipt-offset").value);

	const charHeightFt = unit === "m" ? toFeet(rawHeight) : rawHeight;
	const startOffsetFt = unit === "m" ? toFeet(rawOffset) : rawOffset;

	const strMod = Math.floor((strScore - 10) / 2);
	const jumpRunFt = Math.max(0, 3 + strMod);
	const jumpStandFt = jumpRunFt / 2;
	const jumpDiffFt = jumpRunFt - jumpStandFt;

	const armExtensionFt = charHeightFt / 2;
	const totalReachRunFt = startOffsetFt + charHeightFt + armExtensionFt + jumpRunFt;
	const totalReachStandFt = startOffsetFt + charHeightFt + armExtensionFt + jumpStandFt;
	const maxClearanceRunFt = startOffsetFt + jumpRunFt;

	setText("out-high-run-ft", jumpRunFt);
	setText("out-high-run-m", toMeters(jumpRunFt));
	setText("out-high-stand-ft", jumpStandFt);
	setText("out-high-stand-m", toMeters(jumpStandFt));
	setText("out-high-diff-ft", jumpDiffFt);
	setText("out-high-diff-m", toMeters(jumpDiffFt));
	setText("out-reach-run-ft", totalReachRunFt);
	setText("out-reach-run-m", toMeters(totalReachRunFt));
	setText("out-reach-stand-ft", totalReachStandFt);
	setText("out-reach-stand-m", toMeters(totalReachStandFt));
	setText("out-clearance-run-ft", maxClearanceRunFt);
	setText("out-clearance-run-m", toMeters(maxClearanceRunFt));
};

window.addEventListener("load", () => {
	[
		"ipt-long-str",
		"ipt-high-str",
		"sel-unit",
		"ipt-height",
		"ipt-offset",
	].forEach(id => {
		document.getElementById(id).addEventListener("input", () => {
			updateLongJump();
			updateHighJump();
		});
	});

	updateLongJump();
	updateHighJump();

	window.dispatchEvent(new Event("toolsLoaded"));
});
