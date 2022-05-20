import { mapListToDOMElements, createDOMElem } from './domIntersections.js'
import { getShowsByKey, getShowsById } from './requests.js';

class TvApp {
    constructor() {
        this.viewElems = {};
        this.showNameButtons = {};
        if (localStorage.getItem('favouriteShows')) {
            this.favouriteShowsList = JSON.parse(localStorage.getItem('favouriteShows'));
        } else {
            this.favouriteShowsList = [];
        }
        if (localStorage.getItem('keyWords')) {
            this.keyWordsList = JSON.parse(localStorage.getItem('keyWords'));
        } else {
            this.keyWordsList = [];
        }
        this.selectedName = "harry";
        this.initializeApp();
    }

    initializeApp = () => {
        this.connectDOMElement();
        this.setupListeners();
        this.fetchAndDisplayShows();
        this.renderKeyWord();
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
        this.viewElems.btnAdd.addEventListener('click', this.addNewKeyWord);
        Object.keys(this.showNameButtons).forEach(showName => {
            this.showNameButtons[showName].addEventListener('click', this.setCurrentNameFilter);
        });

        this.viewElems.tvButton.addEventListener('click', this.searchShow);
        this.viewElems.tvInput.addEventListener('keydown', this.searchShow);
        this.viewElems, btnFav.addEventListener('click', this.getfavouriteShowsList)


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
            if (container.lastElementChild !== this.viewElems.showsWrapper) {
                container.removeChild(container.lastElementChild);
            }
            this.viewElems.tvInput.value = '';
        }
    }

    addNewKeyWord = (event) => {
        event.preventDefault();
        let keyWordsValue = Array.from(this.viewElems.dropdownMenu.children);
        if (this.viewElems.tvInput.value !== '') {
            const btnItem = createDOMElem('button', 'dropdown-item', this.viewElems.tvInput.value);

            btnItem.dataset.showName = this.viewElems.tvInput.value;

            this.viewElems.dropdownMenu.prepend(btnItem);
            this.showNameButtons[this.viewElems.tvInput.value] = btnItem;
            this.keyWordsList.push(this.viewElems.tvInput.value);
            localStorage.setItem('keyWords', JSON.stringify(this.keyWordsList));

            const pNewKey = createDOMElem('p', 'p-key-message', 'New keyword has been added');

            this.viewElems.dropdown.appendChild(pNewKey);

            setTimeout(() => {
                pNewKey.style.opacity = '0';
            }, 500)
            setTimeout(() => {
                this.viewElems.dropdown.removeChild(this.viewElems.dropdown.lastElementChild)
            }, 1000)

        }
        Object.keys(this.showNameButtons).forEach(showName => {
            this.showNameButtons[showName].addEventListener('click', this.setCurrentNameFilter);
        });
        this.viewElems.tvInput.value = '';

    }

    renderKeyWord = () => {
        for (const keyWord of this.keyWordsList) {
            const btnItem = createDOMElem('button', 'dropdown-item', keyWord);
            this.viewElems.dropdownMenu.prepend(btnItem);
        }
    }

    fetchAndDisplayShows = () => {
        getShowsByKey(this.selectedName).then(shows => {
            shows.forEach(index => {
                index.show['isFavourite'] = false;
            })

            this.renderCardsOnList(shows)
        });
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

    setFavouriteShow = (event) => {
        const favId = event.target.dataset.showId;

        if (this.favouriteShowsList.indexOf(favId) == -1) {
            this.favouriteShowsList.push(favId);
            event.target.style.backgroundImage = 'url("./img/star.png")';
        } else {
            this.favouriteShowsList.splice(this.favouriteShowsList.indexOf(favId), 1);
            event.target.style.backgroundImage = 'url("./img/star_outline.png")';
        }

        localStorage.setItem('favouriteShows', JSON.stringify(this.favouriteShowsList));
    };


    getfavouriteShowsList = () => {
        this.viewElems.showsWrapper.innerHTML = ''
        if (container.lastElementChild !== this.viewElems.showsWrapper) {
            container.removeChild(container.lastElementChild);
        }

        if (this.favouriteShowsList.length > 0) {
            this.viewElems.showsWrapper.innerHTML = "";

            for (const favourite of this.favouriteShowsList) {
                getShowsById(favourite).then(show => {
                    const card = this.createShowCard(show);

                    this.viewElems.showsWrapper.appendChild(card);
                });
            }
        } else {
            let divErrorHandler = createDOMElem('div', 'div-error-handler');
            let h1Error = createDOMElem('h1', 'h1-error', 'No series has been added');
            let pError = createDOMElem('p', 'p-error', `We're terribly sorry, no series has been added to favourites`);

            divErrorHandler.style.display = 'flex';
            divErrorHandler.appendChild(h1Error);
            divErrorHandler.appendChild(pError);
            this.viewElems.container.appendChild(divErrorHandler);
        }
    }


    removeTags = (str) => {
        str = str.toString();
        return str.replace(/(<([^>]+)>)/ig, '');
    }


    createShowCard = (show, isDetailed) => {
        const divCard = createDOMElem('div', 'card');
        const divCardBody = createDOMElem('div', 'card-body');
        const divCardHeader = createDOMElem('div', 'card-preview-header');
        const divCardSummary = createDOMElem('div', 'card-summary');
        const divCardCastMembers = createDOMElem('div', 'card-cast-members')
        const h5 = createDOMElem('h5', 'card-title', show.name);
        const btn = createDOMElem('button', 'btn btn-primary', 'Show details');
        const pGenres = createDOMElem('p', 'p-genres', "Genres: ");
        let btnFav = createDOMElem('button', 'fav-icon');
        let genres = '';
        let p, img;


        if (this.favouriteShowsList.indexOf(show.id.toString()) !== -1) {
            btnFav.style.backgroundImage = 'url("./img/star.png")';
        } else {
            btnFav.style.backgroundImage = 'url("./img/star_outline.png")';
        }


        btnFav.addEventListener('click', this.setFavouriteShow);

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
        btnFav.dataset.showId = show.id;

        if (isDetailed) {
            btn.innerHTML = "Close details"

            btn.addEventListener('click', this.closeDetailsView);
            divCard.appendChild(img)
            divCard.appendChild(divCardBody);
            divCardHeader.appendChild(h5);
            divCardHeader.appendChild(btnFav)
            divCardBody.appendChild(divCardHeader)
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
            divCardBody.appendChild(btnFav);

        }

        return divCard;
    }
}

document.addEventListener('DOMContentLoaded', new TvApp());