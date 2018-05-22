// eslint-disable-next-line max-params
(function main(App, Mobx, React, Mobx_react, City_store, Place_store, Leaflet, nav_map, cities_layer) { // eslint-disable-line max-len
    City_page.prototype = new React.Component;
    Object.assign(City_page.prototype, {
        render,
        componentWillMount: pre_mount,
        componentDidMount: post_mount,
        componentWillReceiveProps: pre_render,
        componentWillUnmount: pre_unmount,
        render_city,
        render_place_li,
        activate_tooltip,
        deactivate_tooltip,
        }); // eslint-disable-line indent
    return module.exports = Mobx_react.observer(City_page);

    // -----------

    function City_page(props) {
        React.Component.call(this, props);
        const city = City_store.find(props.city_slug);
        const places = Place_store.get_all_in_city(props.city_slug);
        const place = Place_store.find(props.place_id);
        const places_render_data = new Map;
        this.state = { city, places, place, places_render_data };
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
        if (!city || !places) {
            return null;
        }
        this.deactivate_tooltip();
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
                { this.render_city() }
            </div>
            <a
                href={ model.instagram_url }
                className="instagram instagram-city"
                title={ `#BEin${ city.title }` }
                target="_blank"
                style={ { display: 'none' } }
                />
            </React.Fragment>; // eslint-disable-line indent
    }

    function post_mount() {
        const places_render_data = new Map;
        const place_list_element
            = document.getElementsByClassName('place-list')[0]
            ; // eslint-disable-line indent
        const place_list_item_elements
            = document.getElementsByClassName('place-list-item')
            ; // eslint-disable-line indent
        let top_margin = 0;
        let tallest_height = 0;
        for (const list_item_element of place_list_item_elements) {
            const details_element
                = list_item_element.querySelector('.place-details')
                ;
            const details_height = details_element.offsetHeight;
            places_render_data.set(
                list_item_element.dataset.id,
                { top_margin, details_height },
                ); // eslint-disable-line indent
            top_margin -= details_height;
            tallest_height = Math.max(tallest_height, details_height);
        }
        const place_list_element_height
            = place_list_element.offsetHeight
            + top_margin // because it's negative
            + tallest_height // static height that'll fit tallest detail section
            ; // eslint-disable-line indent
        this.setState({ places_render_data, place_list_element_height });
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

    function render_city() {
        const { place_markers } = this;
        const { places, place_list_element_height } = this.state;
        const city = this.state.city.get();
        const active_place = this.state.place.get();
        const place_li_list = [];
        for (const place of places) {
            place_li_list.push(this.render_place_li(
                { city, place, active_place },
                )); // eslint-disable-line indent
        }
        if (active_place) {
            this.activate_tooltip(active_place.google_place_id);
            nav_map.flyTo(active_place.lat_long.split(',').map(Number));
        }
        return <React.Fragment>
            <h1 className="city-title">
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
            <p>
                { city.description }
            </p>
            <hr/>
            <ul
                className="place-list"
                style={ { height: place_list_element_height || 'auto' } }
                >
                { place_li_list }
            </ul>
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

    function render_place_li({ city, place, active_place }) {
        const { places_render_data } = this.state;
        const google_blurb = place && place.google_blurb
            ? <span className="place-blurb-google">
                { place.google_blurb }
                </span>
            : null
            ; // eslint-disable-line indent
        const be_blurb = place && place.be_blurb
            ? <span className="place-blurb-be">{ place.be_blurb }</span>
            : null
            ; // eslint-disable-line indent
        const path = `/city/${ city.slug }/${ place.google_place_id }`;
        const address = place.address.split('\n').map(
            (i) => <React.Fragment key={ i }>{ i }<br/></React.Fragment>,
            ); // eslint-disable-line indent

        const style = {};
        const render_data = this.state.places_render_data.get(place.id);
        if (render_data && !isNaN(render_data.top_margin)) {
            style.transform = `translateY(${ render_data.top_margin }px)`;
        }
        let className = 'place-list-item';
        active_place
            && place.google_place_id === active_place.google_place_id
            && (className += ' on')
            ; // eslint-disable-line indent
        return (
            <li
                key={ place.id }
                className={ className }
                data-id={ place.id }
                style={ style }
                >
                <span
                    data-google_place_id={ place.google_place_id }
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
                    { google_blurb }
                    { be_blurb }
                </div>
                <div className="place-details">
                    <a
                        href={ `tel:${ place.phone.replace(/\s/g, '') }` }
                        className="place-phone"
                        >
                        { place.phone }
                    </a>
                    <a
                        href={ place.google_maps_web_url }
                        target="_blank"
                        className="place-address"
                        >
                        { address }
                    </a>
                </div>
            </li>
            ); // eslint-disable-line indent
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

    // -----------

    function click_place_li(click_event) {
        App.history.push({ path: click_event.target.dataset.path });
    }

    function mouseover_place_li(mouse_event) {
        this.activate_tooltip(mouse_event.target.dataset.google_place_id);
    }

    function mouseout_place_li(mouse_event) {
        this.deactivate_tooltip();
    }

    function click_marker(click_event) {
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
