const PATH_INDEX = "data/grimoriomaulino/index.json";

class GrimorioMaulino {
	constructor () {
		this._state = {
			campaignId: null,
			sectionId: null,
			pageId: null,
		};
		this._index = null;
		this._campaigns = {};

		this._subtitle = document.getElementById("page__subtitle");
		this._menu = document.getElementById("grimorio-menu");
		this._content = document.getElementById("grimorio-content");
	}

	async pInit () {
		this._index = await this._pLoadIndex();
		await this._pLoadCampaigns();
		this._renderMenu();
		this._initHashHandling();
	}

	async _pLoadCampaigns () {
		for (const campaignMeta of this._index?.campaigns || []) {
			if (!campaignMeta.path) continue;

			const response = await fetch(campaignMeta.path);
			if (!response.ok) throw new Error(`No se pudo cargar ${campaignMeta.path}`);
			const campaign = await response.json();
			this._campaigns[campaign.id] = campaign;
		}
	}

	async _pLoadIndex () {
		const response = await fetch(PATH_INDEX);
		if (!response.ok) throw new Error(`No se pudo cargar ${PATH_INDEX}`);
		return response.json();
	}

	_initHashHandling () {
		window.addEventListener("hashchange", () => this._pApplyHash().then(null));
		this._pApplyHash().then(null);
	}

	async _pApplyHash () {
		const [campaignId, sectionId, pageId] = (window.location.hash.slice(1) || "").split("/");

		const campaign = this._getCampaignById(campaignId) || this._getFirstCampaign();
		if (!campaign) return this._renderEmpty("No hay campañas configuradas en el índice.");

		const section = this._getSectionById(campaign, sectionId) || campaign.secciones?.[0];
		if (!section) return this._renderEmpty(`La campaña "${campaign.name}" no tiene secciones.`);

		const page = this._getPageById(section, pageId) || section.paginas?.[0];
		if (!page) return this._renderEmpty(`La sección "${section.name}" no tiene páginas.`);

		this._state.campaignId = campaign.id;
		this._state.sectionId = section.id;
		this._state.pageId = page.id;

		const nextHash = `${campaign.id}/${section.id}/${page.id}`;
		if (window.location.hash.slice(1) !== nextHash) {
			window.location.hash = nextHash;
			return;
		}

		this._renderMenu();
		await this._pLoadPage({campaign, section, page});
	}

	_getCampaignById (campaignId) {
		return this._campaigns[campaignId];
	}

	_getFirstCampaign () {
		const firstId = this._index?.campaigns?.[0]?.id;
		return firstId ? this._campaigns[firstId] : null;
	}

	_getSectionById (campaign, sectionId) {
		return campaign?.secciones?.find(it => it.id === sectionId);
	}

	_getPageById (section, pageId) {
		return section?.paginas?.find(it => it.id === pageId);
	}

	_renderMenu () {
		this._menu.innerHTML = "";

		for (const campaignMeta of this._index?.campaigns || []) {
			const campaign = this._campaigns[campaignMeta.id];
			if (!campaign) continue;

			const eleCampaign = document.createElement("div");
			eleCampaign.className = "ve-flex-col ve-mb-2";

			const eleCampaignTitle = document.createElement("div");
			eleCampaignTitle.className = "book-head-header";
			eleCampaignTitle.textContent = campaign.name;
			eleCampaign.appendChild(eleCampaignTitle);

			for (const section of campaign.secciones || []) {
				const eleSection = document.createElement("details");
				eleSection.className = "ve-flex-col ve-mb-2";
				eleSection.open = this._state.campaignId === campaign.id && this._state.sectionId === section.id;

				const eleSectionTitle = document.createElement("summary");
				eleSectionTitle.className = "lst__row-inner";
				eleSectionTitle.textContent = section.name;
				eleSection.appendChild(eleSectionTitle);

				for (const page of section.paginas || []) {
					const elePage = document.createElement("a");
					elePage.href = `#${campaign.id}/${section.id}/${page.id}`;
					elePage.className = "lst--border lst__row-inner";
					elePage.textContent = page.name;

					if (this._state.campaignId === campaign.id && this._state.sectionId === section.id && this._state.pageId === page.id) {
						elePage.classList.add("list-multi-selected");
					}

					eleSection.appendChild(elePage);
				}

				eleCampaign.appendChild(eleSection);
			}

			this._menu.appendChild(eleCampaign);
		}
	}

	async _pLoadPage ({campaign, section, page}) {
		this._subtitle.textContent = `Campaña: ${campaign.name} · Sección: ${section.name} · Página: ${page.name}`;

		const htmlPath = `data/grimoriomaulino/campanias/${campaign.id}/${page.html}`;
		const response = await fetch(htmlPath);
		if (!response.ok) return this._renderEmpty(`No se pudo cargar la página (${htmlPath}).`);
		const html = await response.text();
		this._content.innerHTML = html;
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
