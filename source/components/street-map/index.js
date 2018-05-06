// eslint-disable-next-line max-params
(function main(Mobx, React, Mobx_react, Leaflet) {
    'use strict';

    let m = 0;
    Street_map.prototype = new React.Component;
    Street_map.prototype.constructor = Street_map;
    Street_map.prototype.render = render;
    Street_map.prototype.componentDidMount = post_mount;
    return module.exports = Mobx_react.observer(Street_map);

    // -----------

    function Street_map(props) {
        React.Component.call(this, props);
        this.state = {
            id: `street-map-${ m++ }`,
            places: props.places,
            }; // eslint-disable-line
    }

    function render() {
        const state = this.state;
        // plot_markers();
        return <div id={ state.id } className="street-map"></div>;
    }

    function post_mount() {
        const this_component = this;
        const props = this_component.props;
        const state = this_component.state;

        this_component.street_map = Leaflet.map(state.id, {
            center: [ 0, 0 ],
            zoom: 1,
            zoomSnap: 0,
            zoomControl: true,
            attributionControl: false,
        });

        const nw = props.nw_corner_coordinates;
        const se = props.se_corner_coordinates;
        this_component.street_map.fitBounds(
            // eslint-disable-next-line new-cap
            (new Leaflet.featureGroup([
                // eslint-disable-next-line new-cap
                new Leaflet.marker([ nw.latitude, nw.longitude ]),
                // eslint-disable-next-line new-cap
                new Leaflet.marker([ se.latitude, se.longitude ]),
                ])) // eslint-disable-line
                .getBounds(),
            )
        ;

        Leaflet.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', { // eslint-disable-line max-len
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 16,
            ext: 'png',
        }).addTo(this_component.street_map);

        Mobx.autorun(plot_markers.bind(this_component));
        return true;
    }

    function plot_markers() {
        const this_component = this;
        const state = this_component.state;
        const places = state.places.get();
        for (let i = 0, n = places.length - 1; i <= n; i++) {
            const place = places[i];
            const coordinates = [
                place.coordinates.latitude,
                place.coordinates.longitude,
            ];
            const marker = Leaflet.marker(coordinates, {
                riseOnHover: true,
                title: place.name,
                alt: place.name,
            });
            marker.addTo(this_component.street_map);
            marker.bindTooltip(place.name, {
                // permanent: true,
                interactive: true,
            });
        }
        return true;
    }
}(
    require('mobx'),
    require('react'),
    require('mobx-react'),
    window.L, // require('leaflet')
));
