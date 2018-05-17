// eslint-disable-next-line max-params
(function main(App, Mobx, React, Mobx_react, City_store, Place_store, Leaflet, nav_map, cities_layer) { // eslint-disable-line max-len
    City_page.prototype = new React.Component;
    City_page.constructor = City_page;
    City_page.prototype.render = render;
    City_page.prototype.componentWillMount = pre_mount;
    City_page.prototype.componentWillReceiveProps = pre_render;
    City_page.prototype.componentWillUnmount = pre_unmount;
    City_page.prototype.render_city = render_city;
    City_page.prototype.render_place = render_place;
    City_page.prototype.render_place_li = render_place_li;
    City_page.prototype.activate_tooltip = activate_tooltip;
    City_page.prototype.deactivate_tooltip = deactivate_tooltip;
    return module.exports = Mobx_react.observer(City_page);

    // -----------

    function City_page(props) {
        React.Component.call(this, props);
        const city = City_store.find(props.city_slug);
        const places = Place_store.get_all_in_city(props.city_slug);
        const place = Place_store.find(props.place_id);
        this.state = { city, places, place };
    }

    function pre_mount() {
        nav_map.removeLayer(cities_layer);
        const places_layer = add_places_layer.call(this);
        const html_class_list = document.documentElement.classList;
        nav_map.fitBounds(places_layer.getBounds(), {
            padding: html_class_list.contains('viewport-small')
                && html_class_list.contains('viewport-portrait')
                    ? [ 10, 50 ]
                    : [ 200, 50 ]
                , // eslint-disable-line
            animate: true,
            }); // eslint-disable-line indent
    }

    function pre_render(next_props) {
        const { props } = this;
        next_props.place_id !== props.place_id
            && this.setState({ place: Place_store.find(next_props.place_id) })
            ;
    }

    function render() {
        const { state, place_markers } = this;
        const city = state.city.get();
        const places = state.places;
        const place = state.place.get();
        // debugger;
        if (!city || !places) {
            return null;
        }
        for (const marker of place_markers) {
            this.deactivate_tooltip(marker);
        }
        const model = {
            go_back_url: place ? `/city/${ city.slug }` : '/',
            go_back_text: place
                ? `Go back to ⨳ Bonjour Explorer #BEin${ city.title }`
                : 'Go back to ⨳ Bonjour Explorer'
                , // eslint-disable-line
            instagram_url:
                `https://www.instagram.com/explore/tags/BEin${ city.title }`,
            }; // eslint-disable-line indent
        return <React.Fragment>
            <span
                onClick={ () => App.history.push({ path: model.go_back_url }) }
                className="go-back"
                title={ model.go_back_text }
                />
            <div className={ `city-page ${ place ? 'place-active' : '' }` }>
                {
                    place
                        ? this.render_place(place, place_markers)
                        : this.render_city(city, places)
                }
            </div>
            <a
                href={ model.instagram_url }
                className="instagram instagram-city"
                title={ `#BEin${ city.title }` }
                target="_blank"
                />
            </React.Fragment>; // eslint-disable-line indent
    }

    function render_city(city, places) {
        const place_li_list = [];
        for (const place of places) {
            place_li_list.push(this.render_place_li(city, place));
        }
        return <React.Fragment>
            <h1>
                { city.title }<br/>
                <a
                    href={ city.google_maps_list_url }
                    target="_blank"
                    className="google-maps-link"
                    >
                    View in Google Maps
                </a>
                <span className="note">
                    Remember to click <strong>Follow</strong>!
                </span>
            </h1>
            <hr/>
            <ul className="place-list">{ place_li_list }</ul>
            <hr/>
            <a
                href={ city.google_maps_wishlist_url }
                target="_blank"
                className="google-maps-wishlist-link"
                >
                View ⨳BE's Wishlist in Google Maps
            </a>
            </React.Fragment>; // eslint-disable-line indent
    }

    function render_place_li(city, place) {
        const be_blurb = place.be_blurb
            ? <em><br/>{ place.be_blurb }</em>
            : null
            ; // eslint-disable-line indent
        const path = `/city/${ city.slug }/${ place.google_place_id }`;
        return (
            <li key={ place.id } className="place-list-item">
                <span
                    data-path={ path }
                    className="place-title"
                    onClick={ click_place_li.bind(this) }
                    onMouseOver={ mouseover_place_li.bind(this) }
                    onMouseOut={ mouseout_place_li.bind(this) }
                    >
                    { place.title }
                    { ' ' }
                    <span className="place-subtitle">{ place.subtitle }</span>
                </span>
                <div className="place-blurb">
                    { place.google_blurb || '—' }
                    { be_blurb }
                </div>
            </li>
            ); // eslint-disable-line indent
    }

    function render_place(place) {
        if (!place) {
            return null;
        }
        this.activate_tooltip(place.google_place_id);
        const address = place.address.split('\n').map(
            (i) => <React.Fragment key={ i }>{ i }<br/></React.Fragment>,
            ); // eslint-disable-line indent
        const be_blurb = place && place.be_blurb
            ? <em><br/>{ place.be_blurb }</em>
            : null
            ; // eslint-disable-line indent
        return <React.Fragment>
            <h1>
                { place.title }
                { ' ' }
                <span className="place-subtitle">{ place.subtitle }</span>
                <br/>
                <a
                    href={ place.website_url } target="_blank"
                    className="google-maps-link"
                    >
                    { place.website_title }
                </a>
                <a
                    href={ place.google_maps_web_url } target="_blank"
                    className="google-maps-link"
                    >
                    View in Google Maps
                </a>
            </h1>
            <p>{ place.phone }</p>
            <p>{ address }</p>
            <div className="place-blurb">
                { place.google_blurb || '—' }
                { be_blurb }
            </div>
            </React.Fragment>; // eslint-disable-line indent
    }

    function add_places_layer() {
        const { places } = this.state;
        const city = this.state.city.get();
        const place_markers = this.place_markers = [];
        for (let i = 0, n = places.length - 1; i <= n; i++) {
            const place = places[i];
            const coordinates = place.lat_long.split(',');
            const marker = Leaflet.marker(coordinates, {
                riseOnHover: true,
                alt: place.title,
                place: { id: place.google_place_id, title: place.title },
                city: { title: city.title, slug: city.slug },
                }); // eslint-disable-line indent
            marker.bindTooltip(
                build_tooltip_content(place),
                { interactive: true },
                ); // eslint-disable-line indent
            marker.on('click', click_marker.bind(this));
            marker.on('mouseout', mouseout_marker.bind(this));
            place_markers.push(marker);
        }
        const places_layer
            = this.places_layer
            = new Leaflet.featureGroup(place_markers)
            ; // eslint-disable-line indent
        places_layer.addTo(nav_map);
        return places_layer;

        // -----------

        function build_tooltip_content(place) {
            let tooltip_content;
            if (place.subtitle) {
                tooltip_content = document.createElement('span');
                tooltip_content.appendChild(
                    document.createTextNode(`${ place.title } `),
                    ); // eslint-disable-line indent
                const subtitle_html = document.createElement('span');
                subtitle_html.className = 'place-subtitle';
                subtitle_html.appendChild(
                    document.createTextNode(place.subtitle),
                    ); // eslint-disable-line indent
                tooltip_content.appendChild(subtitle_html);
            } else {
                tooltip_content = place.title || '';
            }
            return tooltip_content;
        }
    }

    function pre_unmount() {
        this.places_layer && nav_map.removeLayer(this.places_layer);
        cities_layer
            && nav_map.addLayer(cities_layer)
            && nav_map.fitBounds(
                cities_layer.getBounds(),
                { padding: [ 50, 50 ], animate: true, duration: 2 },
                ) // eslint-disable-line indent
            ; // eslint-disable-line indent
    }

    // -----------

    function click_place_li(click_event) {
        App.history.push({ path: click_event.target.dataset.path });
    }

    function mouseover_place_li(mouse_event) {
        const id = mouse_event.target.dataset.path.split('/').pop();
        this.activate_tooltip(id);
    }

    function mouseout_place_li(mouse_event) {
        this.deactivate_tooltip();
    }

    function click_marker(click_event) {
        const marker = click_event.target;
        this.activate_tooltip(marker);
        const { city, place } = click_event.target.options;
        App.history.push({
            path: `/city/${ city.slug }/${ place.id }`,
            page: {
                // eslint-disable-next-line max-len
                title: `⨳ Bonjour Explorer #BEin${ city.title } ⫸ ${ place.title }`,
                }, // eslint-disable-line indent
            }); // eslint-disable-line indent
    }

    function mouseout_marker(mouse_event) {
        const marker = mouse_event.target;
        const { place } = marker.options;
        this.props.place_id === place.id && this.activate_tooltip(marker);
    }

    // -----------

    function activate_tooltip(raw_marker) {
        const marker = 'string' === typeof raw_marker
            ? this.place_markers.reduce(
                (r, m) => r || m.options.place.id === raw_marker && m,
                null,
                ) // eslint-disable-line indent
            : raw_marker
            ; // eslint-disable-line indent
        marker._icon.classList.add('active');
        marker.openTooltip();
    }

    function deactivate_tooltip(raw_marker) {
        if (!raw_marker) {
            for (const marker of this.place_markers) {
                if (marker.options.place.id !== this.props.place_id) {
                    marker._icon.classList.remove('active');
                    marker.closeTooltip();
                }
            }
        } else {
            const marker = 'string' === typeof raw_marker
                ? this.place_markers.reduce(
                    (r, m) => r || m.options.place.id === raw_marker && m,
                    null,
                    ) // eslint-disable-line indent
                : raw_marker
                ; // eslint-disable-line indent
            marker._icon.classList.remove('active');
            marker.closeTooltip();
        }
    }
}(
    require('../../index.js'),
    require('mobx'),
    require('react'),
    require('mobx-react'),
    require('../../stores/city'),
    require('../../stores/place'),
    window.L, // require('leaflet')
    window.nav_map, // ugh
    window.cities_layer, // ugh
));
