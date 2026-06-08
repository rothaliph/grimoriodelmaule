export const GrimorioMaulinoUtil = {
	getUrlNoCache: (url) => {
		const urlObj = new URL(url, window.location.href);
		urlObj.searchParams.set("gmCacheBust", Date.now().toString());
		return urlObj.href;
	},

	pFetchJsonFresh: async (url) => {
		const response = await fetch(GrimorioMaulinoUtil.getUrlNoCache(url), {cache: "no-store"});
		if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
		return response.json();
	},
};
