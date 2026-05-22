const PATH_INDEX = "data/grimoriomaulino/index.json";

class GrimorioMaulino {
	constructor () {
		this._state = {
			campaignId: null,
			characterId: null,
		};
		this._index = null;

		this._subtitle = document.getElementById("page__subtitle");
		this._menu = document.getElementById("grimorio-menu");
		this._content = document.getElementById("grimorio-content");
	}

	async pInit () {
		this._index = await this._pLoadIndex();
		this._renderMenu();
		this._initHashHandling();
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
		const [campaignId, characterId] = (window.location.hash.slice(1) || "").split("/");

		const campaign = this._getCampaignById(campaignId) || this._index?.campaigns?.[0];
		if (!campaign) return this._renderEmpty("No hay campañas configuradas en el índice.");

		const character = this._getCharacterById(campaign, characterId) || campaign.characters?.[0];
		if (!character) return this._renderEmpty(`La campaña "${campaign.name}" no tiene personajes.`);

		this._state.campaignId = campaign.id;
		this._state.characterId = character.id;

		const nextHash = `${campaign.id}/${character.id}`;
		if (window.location.hash.slice(1) !== nextHash) {
			window.location.hash = nextHash;
			return;
		}

		this._renderMenu();
		await this._pLoadCharacter({campaign, character});
	}

	_getCampaignById (campaignId) {
		return this._index?.campaigns?.find(it => it.id === campaignId);
	}

	_getCharacterById (campaign, characterId) {
		return campaign?.characters?.find(it => it.id === characterId);
	}

	_renderMenu () {
		this._menu.innerHTML = "";

		for (const campaign of this._index?.campaigns || []) {
			const eleCampaign = document.createElement("div");
			eleCampaign.className = "ve-flex-col ve-mb-2";

			const eleCampaignTitle = document.createElement("div");
			eleCampaignTitle.className = "book-head-header";
			eleCampaignTitle.textContent = campaign.name;
			eleCampaign.appendChild(eleCampaignTitle);

			for (const character of campaign.characters || []) {
				const eleCharacter = document.createElement("a");
				eleCharacter.href = `#${campaign.id}/${character.id}`;
				eleCharacter.className = "lst--border lst__row-inner";
				eleCharacter.textContent = character.name;

				if (this._state.campaignId === campaign.id && this._state.characterId === character.id) {
					eleCharacter.classList.add("list-multi-selected");
				}

				eleCampaign.appendChild(eleCharacter);
			}

			this._menu.appendChild(eleCampaign);
		}
	}

	async _pLoadCharacter ({campaign, character}) {
		this._subtitle.textContent = `Campaña: ${campaign.name} · Personaje: ${character.name}`;

		const htmlPath = `data/grimoriomaulino/campanias/${campaign.id}/${character.html}`;
		const response = await fetch(htmlPath);
		if (!response.ok) return this._renderEmpty(`No se pudo cargar el personaje (${htmlPath}).`);
		const html = await response.text();
		this._content.innerHTML = html;
	}

	_renderEmpty (message) {
		this._content.innerHTML = `<p class="initial-message initial-message--med">${message}</p>`;
		this._subtitle.textContent = `Campaña: ${campaign.name} · Personaje: ${character.name}`;
	}
}

window.addEventListener("load", async () => {
	const app = new GrimorioMaulino();
	await app.pInit();
});
