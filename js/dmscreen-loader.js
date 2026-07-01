const pLoadDmScreen = (() => {
	let pLoad = null;

	return () => pLoad ||= import("./dmscreen.js");
})();

if (document.readyState === "complete") pLoadDmScreen();
else window.addEventListener("load", pLoadDmScreen, {once: true});
