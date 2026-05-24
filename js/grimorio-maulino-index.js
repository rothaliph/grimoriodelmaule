const PATH_INDEX = "data/grimoriomaulino/index.json";

class GrimorioMaulinoIndexPage {
	constructor () {
		this._grid = document.getElementById("grimorio-campaign-grid");
	}

	async pInit () {
		const index = await this._pLoadIndex();
		const campaigns = await this._pLoadCampaigns(index);
		this._renderCampaigns(campaigns);
	}

	async _pLoadIndex () {
		const response = await fetch(PATH_INDEX);
		if (!response.ok) throw new Error(`No se pudo cargar ${PATH_INDEX}`);
		return response.json();
	}

	async _pLoadCampaigns (index) {
		const out = [];
		for (const campaignMeta of index?.campaigns || []) {
			if (!campaignMeta.path) continue;
			const response = await fetch(campaignMeta.path);
			if (!response.ok) continue;
			const campaign = await response.json();
			out.push(campaign);
		}
		return out;
	}

	_renderCampaigns (campaigns) {
		this._grid.innerHTML = "";

		for (const campaign of campaigns) {
			const card = document.createElement("a");
			card.className = "grimoire-campaign-card ve-btn ve-btn-default ve-text-left";
			card.href = `grimorio-maulino.html#${campaign.id}`;
			card.title = `Abrir campaña ${campaign.name}`;

			const img = document.createElement("img");
			img.className = "grimoire-campaign-card__img";
			img.src = campaign.image || "https://placehold.co/1200x675?text=Sin+imagen";
			img.alt = campaign.name;

			const body = document.createElement("div");
			body.className = "grimoire-campaign-card__body";

			const title = document.createElement("h3");
			title.className = "ve-my-0";
			title.textContent = campaign.name;

			const desc = document.createElement("p");
			desc.className = "grimoire-campaign-card__desc";
			desc.textContent = campaign.description || "Sin descripción.";

			body.append(title, desc);
			card.append(img, body);
			this._grid.append(card);
		}
	}
}

window.addEventListener("load", async () => {
	const app = new GrimorioMaulinoIndexPage();
	await app.pInit();
});
