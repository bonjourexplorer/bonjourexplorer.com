// eslint-disable-next-line max-params
(function main(
    Mobx,
    React,
    Mobx_react,
    City_store,
    Place_store,
    Leaflet,
    nav_map,
    cities_layer,
    ) {
    'use strict';

    City_page.prototype = new React.Component;
    City_page.constructor = City_page;
    City_page.prototype.render = render;
    City_page.prototype.componentWillMount = pre_mount;
    City_page.prototype.componentWillUnmount = pre_unmount;
    return module.exports = Mobx_react.observer(City_page);

    // -----------

    function City_page(props) {
        React.Component.call(this, props);
        const city = City_store.find(props.city_slug);
        const places = Place_store.get_all_in_city(props.city_slug);
        this.state = { city, places };
    }

    function pre_mount() {
        const { places } = this.state;
        nav_map.removeLayer(cities_layer);
        const places_layer = add_places_layer.call(this, places);
        nav_map.fitBounds(
            places_layer.getBounds(),
            // eslint-disable-next-line
            { padding: [ 50, 50 ], animate: true, pan: { animate: true }, zoom: { animate: true } },
            );
        nav_map.once('moveend zoomend', function then_offset_pan() {
            const root_element = document.documentElement;
            const root_class_list = root_element.classList;
            const viewport_height = Number(
                root_element.getAttribute('data-viewport-height'),
                ); // eslint-disable-line indent
            const app_element = document.getElementById('app');
            const offset = root_class_list.contains('viewport-small')
                && root_class_list.contains('viewport-portrait')
                    ? [ 0, -0.25 * viewport_height ]
                    : [ -0.5 * app_element.offsetWidth, 0 ]
                ; // eslint-disable-line indent
            const map_center = nav_map.getSize().divideBy(2);
            const offset_map_center = map_center.subtract(offset);
            const lat_long = nav_map.containerPointToLatLng(offset_map_center);
            nav_map.panTo(lat_long);
            }); // eslint-disable-line indent
    }

    function render() {
        const state = this.state;
        const city = state.city.get();
        const places = state.places;
        if (!city || !places) {
            return null;
        }
        const place_li_list = places.map(render_place_li);
        return (
            <div className="city-page">
                <h1>
                    { city.title }<br/>
                    <a
                        href={ city.google_maps_list_url }
                        target="_blank"
                        className="google-maps-link"
                        >
                        View in Google Maps
                    </a>
                </h1>
                <ul className="place-list">{ place_li_list }</ul>
            </div>
            ); // eslint-disable-line indent
    }

    function render_place_li(place) {
        const be_blurb = place.be_blurb
            ? <em><br/>✳BE: { place.be_blurb }</em>
            : null
            ; // eslint-disable-line indent
        return (
            <li key={ place.id } className="place-list-item">
                <a
                    href={ place.website_url }
                    target="_blank"
                    className="place-title"
                    >
                    { place.title }
                    { ' ' }
                    <span className="place-subtitle">
                        { place.subtitle }
                    </span>
                </a>
                <div className="place-blurb">
                    { place.google_blurb || '—' }
                    { be_blurb }
                </div>
            </li>
            ); // eslint-disable-line indent
    }

    function add_places_layer(places) {
        const place_markers = [];
        for (let i = 0, n = places.length - 1; i <= n; i++) {
            const place = places[i];
            const coordinates = place.lat_long.split(',');
            const marker = Leaflet.marker(coordinates, {
                riseOnHover: true,
                title: place.title,
                alt: place.title,
                }); // eslint-disable-line
            // marker.on('click', click_marker);
            place_markers.push(marker);
        }
        const places_layer
            = this.places_layer
            = new Leaflet.featureGroup(place_markers)
            ; // eslint-disable-line indent
        places_layer.addTo(nav_map);
        return places_layer;
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
}(
    require('mobx'),
    require('react'),
    require('mobx-react'),
    require('../../stores/city'),
    require('../../stores/place'),
    window.L, // require('leaflet')
    window.nav_map, // ugh
    window.cities_layer, // ugh
));
