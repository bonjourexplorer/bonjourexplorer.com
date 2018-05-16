// eslint-disable-next-line max-params
(function main(
    App,
    Mobx,
    React,
    React_dom,
    Veil,
    Leaflet,
    City_store,
    ) {
    const html_element_class_list = document.documentElement.classList;
    document.addEventListener('DOMContentLoaded', load_app);
    return module.exports = App;

    // -----------

    function load_app() {
        if (html_element_class_list.contains('loading')) {
            html_element_class_list.remove('loading');
            (render_nav_map() && render_app() && render_main_nav())
                || html_element_class_list.add('loading-failed')
                ;
        }
        return true;
    }

    // -----------

    function render_main_nav() {
        let main_nav_toggler;
        let main_nav_class_list;
        let veil;

        return (main_nav_toggler = document.getElementById('main-nav-toggler'))
            && (main_nav_class_list = document.getElementById('main-nav'))
            && (main_nav_class_list = main_nav_class_list.classList)
            && !main_nav_toggler.addEventListener('click', click_menu_toggler)
            && !document.addEventListener('click', click_document)
            && (veil = new Veil({ color: 'rgba(255, 255, 255, 0.8)' }))
            && veil.inject()
            ;

        // -----------

        function click_menu_toggler() {
            toggle_main_nav();
            return true;
        }
        function click_document(event_) {
            const target_class_list = event.target.classList;
            if (main_nav_toggler !== event.target
                && !target_class_list.contains('main-nav')
                && !target_class_list.contains('main-nav-link')
                ) {
                close_main_nav();
            }
            return true;
        }
        function toggle_main_nav() {
            main_nav_class_list.contains('main-nav-active')
                ? !main_nav_class_list.remove('main-nav-active')
                    && veil.deactivate()
                : !main_nav_class_list.add('main-nav-active')
                    && veil.activate()
                ;
            return true;
        }
        function close_main_nav() {
            veil.deactivate();
            main_nav_class_list.remove('main-nav-active');
            return true;
        }
    }

    // -----------

    function render_nav_map() {
        const cities = City_store.get_all();
        const nav_map = window.nav_map = Leaflet.map('nav-map', {
            center: [ 0, 0 ],
            zoom: 10,
            zoomSnap: 0,
            zoomControl: false,
            zoomAnimationThreshold: 100,
            attributionControl: false,
            }); // eslint-disable-line
        Leaflet.tileLayer('//stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', { // eslint-disable-line max-len
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 16,
            ext: 'png',
            }) // eslint-disable-line
            .addTo(nav_map)
            ;
        Mobx.autorun(plot_cities);
        return true;

        // -----------

        function plot_cities() {
            const city_markers = [];
            for (let i = 0, n = cities.length - 1; i <= n; i++) {
                const city = cities[i];
                const coordinates = city.lat_long.split(',');
                const marker = Leaflet.marker(coordinates, {
                    riseOnHover: true,
                    alt: city.title,
                    city_slug: city.slug,
                    }); // eslint-disable-line
                marker.on('click', click_marker);
                marker.bindTooltip(city.title, {
                    permanent: true,
                    interactive: true,
                    }); // eslint-disable-line
                city_markers.push(marker);
            }
            if (city_markers.length) {
                const cities_layer
                    = window.cities_layer
                    = new Leaflet.featureGroup(city_markers)
                    ; // eslint-disable-line indent
                cities_layer.addTo(nav_map);
                nav_map.fitBounds(
                    cities_layer.getBounds(),
                    { padding: [ 50, 50 ] },
                    );
            }
            return true;
        }

        function click_marker(event_) {
            let city_slug;
            let city;
            event_
                && event_.target
                && event_.target.options
                && (city_slug = event_.target.options.city_slug)
                && (city = City_store.find(city_slug).get())
                && App.history.push({
                    path: `/city/${ city_slug }`,
                    page: {
                        title: `#BEin${ city.title }`,
                        props: { city },
                        }, // eslint-disable-line
                    }) // eslint-disable-line
                ;
        }
    }

    // -----------

    function render_app() {
        const app_element = document.getElementById('app');
        if (app_element) {
            App.render({
                element: app_element,
                routes: [
                    {
                        route_pattern: /^\/city\/([^/]+)$/,
                        route_pattern_tokens: [ 'city_slug' ],
                        page_component: require('./pages/city'),
                        }, // eslint-disable-line
                    ], // eslint-disable-line
                }); // eslint-disable-line
        } else {
            throw new Error('There is no app element to load the app into');
        }
        return true;
    }
}(
    require('mobx-react-app'),
    require('mobx'),
    require('react'),
    require('react-dom'),
    require('html-veil'),
    window.L, // require('leaflet')
    require('./stores/city'),
));
