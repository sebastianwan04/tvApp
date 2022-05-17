import { mapListToDOMElements, createDOMElem } from './domIntersections.js'
import { getShowsByKey, getShowsById } from './requests.js';

class TvApp {
    constructor() {
        this.viewElems = {};
        this.showNameButtons = {};
        this.selectedName = "harry";
        this.initializeApp();
    }

    initializeApp = () => {
        this.connectDOMElement();
        this.setupListeners();
        this.fetchAndDisplayShows();
    }

    connectDOMElement = () => {
        const listOfIds = Array.from(document.querySelectorAll('[id]')).map(elem => elem.id);
        const listOfShowNames = Array.from(
            document.querySelectorAll('[data-show-name]')
        ).map(elem => elem.dataset.showName);

        this.viewElems = mapListToDOMElements(listOfIds, 'id');
        this.showNameButtons = mapListToDOMElements(listOfShowNames, 'data-show-name');
    }

    setupListeners = () => {
        Object.keys(this.showNameButtons).forEach(showName => {
            this.showNameButtons[showName].addEventListener('click', this.setCurrentNameFilter);
        });
    }

    setCurrentNameFilter = (event) => {
        this.selectedName = event.target.dataset.showName;
        this.fetchAndDisplayShows();
    }

    fetchAndDisplayShows = () => {
        getShowsByKey(this.selectedName).then(shows => this.renderCards(shows));
    }

    renderCards = (shows) => {
        this.viewElems.showsWrapper.innerHTML = "";
        for (const { show }
            of shows) {
            this.createShowCard(show);
        }
    }

    createShowCard = (show) => {
        const divCard = createDOMElem('div', 'card');
        const divCardBody = createDOMElem('div', 'card-body');
        const h5 = createDOMElem('h5', 'card-title', show.name);
        const btn = createDOMElem('button', 'btn btn-primary', 'Show details');

        let p;
        let img;

        if (show.image) {
            img = createDOMElem('img', 'card-img-top', null, show.image.medium);
        } else {
            img = createDOMElem('img', 'card-img-top', null, 'https://via.placeholder.com/210x295');
        }

        if (show.summary) {
            p = createDOMElem('p', 'card-text', `${show.summary.slice(0,80)}...`);
        } else {
            p = createDOMElem('p', 'card-text', `There is no summary yet for ${show.name}`);
        }


        divCard.appendChild(divCardBody);
        divCardBody.appendChild(img);
        divCardBody.appendChild(h5);
        divCardBody.appendChild(p);
        divCardBody.appendChild(btn);

        this.viewElems.showsWrapper.appendChild(divCard);
    }
}

document.addEventListener('DOMContentLoaded', new TvApp());