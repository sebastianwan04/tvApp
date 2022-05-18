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

        this.viewElems.tvButton.addEventListener('click', this.searchShow);
        this.viewElems.tvInput.addEventListener('keydown', this.searchShow);

    }

    setCurrentNameFilter = (event) => {
        this.selectedName = event.target.dataset.showName;
        this.fetchAndDisplayShows();
    }


    searchShow = (event) => {
        let nameOfShow = this.viewElems.tvInput.value;
        let divErrorHandler = createDOMElem('div', 'div-error-handler');
        let h1Error = createDOMElem('h1', 'h1-error', 'Series not found');
        let pError = createDOMElem('p', 'p-error', `We're terribly sorry, but show ${nameOfShow} was not found`);


        if (event.type === "click" || event.key === "Enter") {
            event.preventDefault();
            getShowsByKey(nameOfShow)
                .then((shows) => {
                    if (shows.length === 0) {
                        divErrorHandler.style.display = 'flex';
                        divErrorHandler.appendChild(h1Error);
                        divErrorHandler.appendChild(pError);
                        this.viewElems.container.appendChild(divErrorHandler);

                    }
                    this.renderCardsOnList(shows)

                })

        }
    }

    fetchAndDisplayShows = () => {
        getShowsByKey(this.selectedName).then(shows => this.renderCardsOnList(shows));
        if (container.lastElementChild !== this.viewElems.showsWrapper) {
            container.removeChild(container.lastElementChild);
        }
    }

    renderCardsOnList = (shows) => {
        Array.from(
            document.querySelectorAll('[data-show-id]')
        ).forEach(btn => btn.removeEventListener('click', this.removeEventListener))

        this.viewElems.showsWrapper.innerHTML = "";

        for (const { show }
            of shows) {
            const card = this.createShowCard(show);
            this.viewElems.showsWrapper.appendChild(card);
        }

    }

    openDetailsView = event => {
        const { showId } = event.target.dataset;
        getShowsById(showId).then(show => {
            const card = this.createShowCard(show, true);
            this.viewElems.showPreview.appendChild(card);
            this.viewElems.showPreview.style.display = 'block'
        })
        document.body.style.overflowY = 'hidden';
    }

    closeDetailsView = event => {
        const { showId } = event.target.dataset;
        const closeBtn = document.querySelector(`[id="showPreview"] [data-show-id="${showId}"]`);
        closeBtn.removeEventListener('click', this.closeDetailsView);
        this.viewElems.showPreview.style.display = 'none'
        this.viewElems.showPreview.innerHTML = ''
        document.body.style.overflowY = 'unset';
    }

    removeTags = (str) => {
        str = str.toString();
        return str.replace(/(<([^>]+)>)/ig, '');
    }

    createShowCard = (show, isDetailed) => {
        const divCard = createDOMElem('div', 'card');
        const divCardBody = createDOMElem('div', 'card-body');
        const divCardSummary = createDOMElem('div', 'card-summary');
        const divCardCastMembers = createDOMElem('div', 'card-cast-members')
        const h5 = createDOMElem('h5', 'card-title', show.name);
        const btn = createDOMElem('button', 'btn btn-primary', 'Show details');
        const pGenres = createDOMElem('p', 'p-genres', "Genres: ");
        let genres = '';
        let p;
        let img;

        if (show.image) {
            if (isDetailed) {
                img = createDOMElem('img', 'card-preview', null, show.image.original);
            } else {
                img = createDOMElem('img', 'card-img-top', null, show.image.medium);
            }
        } else {
            if (isDetailed) {
                img = createDOMElem('img', 'card-preview', null, 'https://via.placeholder.com/210x295');
            } else {
                img = createDOMElem('img', 'card-img-top', null, 'https://via.placeholder.com/210x295');
            }
        }

        if (show.summary) {
            if (isDetailed) {
                p = createDOMElem('p', 'card-text', this.removeTags(show.summary));
            } else {
                p = createDOMElem('p', 'card-text', `${this.removeTags(show.summary).slice(0,80)}...`);
            }
        } else {
            p = createDOMElem('p', 'card-text', `There is no summary yet for ${show.name}`);
        }

        btn.dataset.showId = show.id;

        if (isDetailed) {
            btn.innerHTML = "Close details"

            btn.addEventListener('click', this.closeDetailsView);
            divCard.appendChild(img)
            divCard.appendChild(divCardBody);
            divCardBody.appendChild(h5);
            divCardBody.appendChild(p);


            for (const genre of show.genres) {
                genres += genre + ", ";
            }
            pGenres.innerText += genres.slice(0, genres.length - 2)
            divCardBody.appendChild(pGenres)

            for (const person of show._embedded.cast) {
                let p1 = createDOMElem('p', 'cast-member', `${person.person.name} as `);
                let p2 = createDOMElem('p', 'cast-member-role', `${person.character.name}`);
                let portrait;
                if (person.person.image) {
                    portrait = createDOMElem('img', 'cast-member-portrait', null, person.person.image.medium);
                } else {
                    portrait = createDOMElem('img', 'cast-member-portrait', null, 'https://via.placeholder.com/210x295');

                }
                let divCardCastMember = createDOMElem('div', 'card-cast-member')
                let divCastMemberInfo = createDOMElem('div', 'cast-member-info')

                divCastMemberInfo.appendChild(p1);
                divCastMemberInfo.appendChild(p2);
                divCardCastMember.appendChild(portrait);
                divCardCastMember.appendChild(divCastMemberInfo);
                divCardCastMembers.appendChild(divCardCastMember);
            }
            divCardBody.appendChild(divCardCastMembers);
            divCardBody.appendChild(btn);

        } else {
            btn.addEventListener('click', this.openDetailsView);
            divCard.appendChild(divCardSummary);
            divCard.appendChild(divCardBody);
            divCardSummary.appendChild(img);
            divCardSummary.appendChild(h5);
            divCardSummary.appendChild(p);
            divCardBody.appendChild(btn);

        }

        return divCard;
    }
}

document.addEventListener('DOMContentLoaded', new TvApp());