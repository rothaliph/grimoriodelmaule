import {GrimorioMaulinoUtil} from "./grimorio-maulino-utils.js";

const PATH_INDEX = "data/grimoriomaulino/index.json";

class GrimorioMaulino {
	constructor () {
		this._state = {
			campaignId: null,
			sectionId: null,
			pageId: null,
		};
		this._index = null;
		this._campaign = null;
		this._expandedSections = {};

		this._subtitle = document.getElementById("page__subtitle");
		this._menu = document.getElementById("grimorio-menu");
		this._content = document.getElementById("grimorio-content");
	}

	async pInit () {
		this._index = await this._pLoadIndex();
		await this._pLoadCampaign();
		this._renderMenu();
		this._initHashHandling();
	}

	_getInitialCampaignId () {
		const [campaignId] = (window.location.hash.slice(1) || "").split("/");
		return campaignId || null;
	}

	_getCampaignMetaById (campaignId) {
		return this._index?.campaigns?.find(it => it.id === campaignId) || null;
	}

	_getFirstCampaignMeta () {
		return this._index?.campaigns?.[0] || null;
	}

	async _pLoadCampaign () {
		const campaignId = this._getInitialCampaignId();
		const campaignMeta = this._getCampaignMetaById(campaignId) || this._getFirstCampaignMeta();
		if (!campaignMeta?.path) return;

		this._campaign = await GrimorioMaulinoUtil.pFetchJsonFresh(campaignMeta.path);
	}

	async _pLoadIndex () {
		return GrimorioMaulinoUtil.pFetchJsonFresh(PATH_INDEX);
	}

	_initHashHandling () {
		window.addEventListener("hashchange", () => this._pApplyHash().then(null));
		this._pApplyHash().then(null);
	}

	async _pApplyHash () {
		const [campaignId, sectionId, pageId] = (window.location.hash.slice(1) || "").split("/");

		const campaign = this._campaign;
		if (!campaign) return this._renderEmpty("No hay campañas configuradas en el índice.");
		if (campaignId && campaignId !== campaign.id) return this._renderEmpty(`Campaña no disponible: ${campaignId}.`);

		const section = this._getSectionById(campaign, sectionId) || campaign.secciones?.[0];
		if (!section) return this._renderEmpty(`La campaña "${campaign.name}" no tiene secciones.`);

		const page = this._getPageById(section, pageId) || section.paginas?.[0];
		if (!page) return this._renderEmpty(`La sección "${section.name}" no tiene páginas.`);

		this._state.campaignId = campaign.id;
		this._state.sectionId = section.id;
		this._state.pageId = page.id;

		this._expandedSections[`${campaign.id}__${section.id}`] = true;

		const nextHash = `${campaign.id}/${section.id}/${page.id}`;
		if (window.location.hash.slice(1) !== nextHash) {
			window.location.hash = nextHash;
			return;
		}

		this._renderMenu();
		await this._pLoadPage({campaign, section, page});
	}

	_getSectionById (campaign, sectionId) {
		return campaign?.secciones?.find(it => it.id === sectionId);
	}

	_getPageById (section, pageId) {
		return section?.paginas?.find(it => it.id === pageId);
	}

	_renderMenu () {
		this._menu.innerHTML = "";

		const campaign = this._campaign;
		if (!campaign) return;

		const eleCampaign = document.createElement("div");
		eleCampaign.className = "contents-item";
		eleCampaign.dataset.bookid = campaign.id;

		const eleHeader = document.createElement("div");
		eleHeader.className = "bk__contents-header";

		const eleCampaignTitle = document.createElement("a");
		eleCampaignTitle.href = `#${campaign.id}`;
		eleCampaignTitle.className = "bk__contents_header_link ve-lst__wrp-cells ve-lst__row-inner ve-bold";
		eleCampaignTitle.title = campaign.name;
		eleCampaignTitle.textContent = campaign.name;
		eleHeader.appendChild(eleCampaignTitle);
		eleCampaign.appendChild(eleHeader);

		const eleSectionList = document.createElement("div");
		eleSectionList.className = "bk-contents ve-pl-4 ve-ml-2";

		for (const section of campaign.secciones || []) {
			const eleSection = document.createElement("div");
			eleSection.className = "ve-flex-col";

			const eleSectionHeader = document.createElement("div");
			eleSectionHeader.className = "ve-flex-v-center ve-lst__row-inner";
			eleSectionHeader.title = section.name;

			const eleSectionToggle = document.createElement("span");
			eleSectionToggle.className = "ve-px-2 ve-bold";
			eleSectionHeader.appendChild(eleSectionToggle);

			const eleSectionName = document.createElement("span");
			eleSectionName.textContent = section.name;
			eleSectionHeader.appendChild(eleSectionName);

			eleSection.appendChild(eleSectionHeader);

			const elePageList = document.createElement("div");
			elePageList.className = "ve-flex-col ve-pl-4 ve-ml-2 pagelistsubsection";

			const sectionKey = `${campaign.id}__${section.id}`;
			const isExpanded = this._expandedSections[sectionKey] != null
				? this._expandedSections[sectionKey]
				: this._state.sectionId === section.id;
			eleSectionToggle.textContent = isExpanded ? "[−]" : "[+]";
			if (isExpanded) elePageList.style.removeProperty("display");
			else elePageList.style.setProperty("display", "none", "important");

			eleSectionHeader.addEventListener("click", () => {
				const isCollapsed = elePageList.style.display === "none";
				if (isCollapsed) elePageList.style.removeProperty("display");
				else elePageList.style.setProperty("display", "none", "important");
				eleSectionToggle.textContent = isCollapsed ? "[−]" : "[+]";
				this._expandedSections[sectionKey] = isCollapsed;
			});

			for (const page of section.paginas || []) {
				const elePage = document.createElement("a");
				elePage.href = `#${campaign.id}/${section.id}/${page.id}`;
				elePage.className = "lst--border ve-lst__row-inner";
				elePage.textContent = page.name;

				if (this._state.sectionId === section.id && this._state.pageId === page.id) elePage.classList.add("list-multi-selected");

				elePageList.appendChild(elePage);
			}

			eleSection.appendChild(elePageList);
			eleSectionList.appendChild(eleSection);
		}

		eleCampaign.appendChild(eleSectionList);
		this._menu.appendChild(eleCampaign);

		const eleBack = document.createElement("a");
		eleBack.href = "grimorio-maulino-index.html";
		eleBack.className = "ve-btn ve-btn-default ve-mt-3";
		eleBack.textContent = "Volver a otras campañas";
		this._menu.appendChild(eleBack);
	}

	async _pLoadPage ({campaign, section, page}) {
		this._subtitle.textContent = `Campaña: ${campaign.name} · Sección: ${section.name} · Página: ${page.name}`;

		const pageResource = page.html || page.image;
		if (!pageResource) return this._renderEmpty(`La página "${page.name}" no tiene recurso configurado ("html" o "image").`);

		const resourcePath = `data/grimoriomaulino/campanias/${campaign.id}/${pageResource}`;

		if (page.image || this._isImagePath(pageResource)) {
			this._renderImagePage({resourcePath, pageName: page.name});
			return;
		}

		const response = await fetch(resourcePath);
		if (!response.ok) return this._renderEmpty(`No se pudo cargar la página (${resourcePath}).`);
		const html = await response.text();
		this._content.innerHTML = html;
	}

	_isImagePath (path) {
		return /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i.test(path || "");
	}

	_renderImagePage ({resourcePath, pageName}) {
		this._content.innerHTML = `<div class="ve-flex-h-center"><img class="ve-w-initial ve-max-w-100" src="${resourcePath}" alt="${pageName}"></div>`;
	}

	_renderEmpty (message) {
		this._content.innerHTML = `<p class="initial-message initial-message--med">${message}</p>`;
		this._subtitle.textContent = message;
	}
}

window.addEventListener("load", async () => {
	const app = new GrimorioMaulino();
	await app.pInit();
});
