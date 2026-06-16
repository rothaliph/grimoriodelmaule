import {GrimorioMaulinoUtil} from "./grimorio-maulino-utils.js";

const PATH_INDEX = "data/grimoriomaulino/index.json";
const MAX_DESCRIPTION_LENGTH = 1000;

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
		return GrimorioMaulinoUtil.pFetchJsonFresh(PATH_INDEX);
	}

	async _pLoadCampaigns (index) {
		const out = [];
		for (const campaignMeta of index?.campaigns || []) {
			if (!campaignMeta.path) continue;
			const campaign = await GrimorioMaulinoUtil.pFetchJsonFresh(campaignMeta.path)
				.catch(() => null);
			if (!campaign) continue;
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
			desc.textContent = this._getCardDescription(campaign.description);

			body.append(title, desc);
			card.append(img, body);
			this._grid.append(card);
		}
	}

	_getCardDescription (description) {
		if (!description) return "Sin descripción.";

		if (description.length <= MAX_DESCRIPTION_LENGTH) return description;

		const truncated = description.slice(0, MAX_DESCRIPTION_LENGTH);
		const lastSpaceIx = truncated.lastIndexOf(" ");
		if (lastSpaceIx <= 0) return `${truncated}...`;
		return `${truncated.slice(0, lastSpaceIx)}...`;
	}
}

window.addEventListener("load", async () => {
	const app = new GrimorioMaulinoIndexPage();
	await app.pInit();
});
