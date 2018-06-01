// eslint-disable-next-line max-params
(function main(
    App,
    Mobx,
    React,
    Mobx_react,
    City_store,
    Place_store,
    Leaflet,
    nav_map,
    cities_layer,
    ) { // eslint-disable-line indent
    City_page.prototype = new React.Component;
    Object.assign(City_page.prototype, {
        render,
        componentWillMount: pre_mount,
        componentDidMount: post_mount,
        componentWillReceiveProps: pre_render,
        componentDidUpdate: post_render,
        componentWillUnmount: pre_unmount,
        render_city,
        render_place_li,
        activate_tooltip,
        deactivate_tooltip,
        deactivate_all_tooltips,
        scroll_nicely,
        }); // eslint-disable-line indent
    return module.exports = Mobx_react.observer(City_page);

    // -----------

    function City_page(props) {
        React.Component.call(this, props);
        const city = City_store.find(props.city_slug);
        const places = Place_store.get_all_in_city(props.city_slug);
        const place = Place_store.find(props.google_place_id);
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

    function post_mount() {
        const places_render_data = new Map;
        const page_element
            = document.getElementsByClassName('city-page')[0]
            ; // eslint-disable-line indent
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
            const scroll_to = list_item_element.offsetTop + top_margin;
            places_render_data.set(
                list_item_element.dataset.google_place_id,
                { top_margin, details_height, scroll_to },
                ); // eslint-disable-line indent
            top_margin -= details_height;
            tallest_height = Math.max(tallest_height, details_height);
        }
        page_element.style.height
            = `${ page_element.offsetHeight + top_margin + tallest_height }px`
            ; // eslint-disable-line indent
        const place_list_element_height
            = place_list_element.offsetHeight
            + top_margin // because it's negative
            + tallest_height // static height that'll fit tallest detail section
            ; // eslint-disable-line indent
        this.setState({
            places_render_data,
            place_list_element_height,
            }); // eslint-disable-line indent
    }

    function pre_render(next_props) {
        const { props } = this;
        next_props.google_place_id !== props.google_place_id
            && this.setState({
                place: Place_store.find(next_props.google_place_id),
                }) // eslint-disable-line indent
            ; // eslint-disable-line indent
    }

    function render() {
        const { state } = this;
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

    function post_render() {
        const { query } = this.props;
        const active_place = this.state.place.get();
        if (active_place && (!query || false !== query['scroll?'])) {
            const { places_render_data } = this.state;
            const active_place_render_data
                = places_render_data.get(active_place.google_place_id)
                ; // eslint-disable-line indent
            const { details_height } = active_place_render_data;
            let { scroll_to } = active_place_render_data;

            if (window.innerHeight < window.innerWidth
                || window.innerHeight > 640
                ) { // eslint-disable-line indent
                scroll_to -= (window.innerHeight / 2) - details_height;
            }
            this.city_drawer = this.city_drawer
                || document.getElementsByClassName('city-page')[0]
                ; // eslint-disable-line indent
            if (this.city_drawer) {
                this.is_fully_loaded
                    ? this.scroll_nicely(this.city_drawer, scroll_to)
                    : this.city_drawer.scrollTop = scroll_to
                    ; // eslint-disable-line indent
            }
        }
        this.is_fully_loaded = true;
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
        const { places, place_list_element_height } = this.state;
        const city = this.state.city.get();
        const active_place = this.state.place.get();
        const active_place_render_data = active_place
            && this.state.places_render_data.get(active_place.google_place_id)
            ; // eslint-disable-line indent
        const place_li_list = [];
        let top_padding = 0;
        for (const place of places) {
            place_li_list.push(this.render_place_li(
                { city, place, active_place, top_padding },
                )); // eslint-disable-line indent
            active_place
                && place.google_place_id === active_place.google_place_id
                && active_place_render_data
                && (top_padding = active_place_render_data.details_height)
                ; // eslint-disable-line indent
        }
        if (active_place) {
            const { query } = this.props;
            this.activate_tooltip(active_place.google_place_id);
            (!query || false !== query['pan?'])
                && nav_map.flyTo(active_place.lat_long.split(',').map(Number))
                ;
        }
        return <React.Fragment>
            <div className="city-summary">
                <h1 className="city-title">
                    { city.title }
                </h1>
                <div className="google-maps-widget">
                    <span className="note">
                        Remember to <strong>Follow</strong>!
                    </span>
                    <a
                        href={ city.google_maps_list_url }
                        target="_blank"
                        className="google-maps-link"
                        >
                        Favorites
                    </a>
                    <a
                        href={ city.google_maps_wishlist_url }
                        target="_blank"
                        className="google-maps-wishlist-link"
                        >
                        Wishlist
                    </a>
                </div>
                <hr/>
                <p>
                    { city.description }
                </p>
            </div>
            <hr/>
            <ul
                className="place-list"
                style={ { height: place_list_element_height || 'auto' } }
                >
                { place_li_list }
            </ul>
            </React.Fragment>; // eslint-disable-line indent
    }

    function render_place_li({ city, place, active_place, top_padding }) {
        const style = {};
        const path = `/city/${ city.slug }/${ place.google_place_id }`;
        const mouse_attributes = {
            'data-google_place_id': place.google_place_id,
            'data-path': path,
            'data-noscroll': true,
            onClick: click_place_li.bind(this),
            onMouseOver: mouseover_place_li.bind(this),
            onMouseOut: mouseout_place_li.bind(this),
            }; // eslint-disable-line indent
        const render_data = this.state.places_render_data
            .get(place.google_place_id)
            ; // eslint-disable-line indent

        const google_blurb = place && place.google_blurb
            ? <span className="place-blurb-google" { ...mouse_attributes }>
                { place.google_blurb }
                </span>
            : null
            ; // eslint-disable-line indent
        const be_blurb = place && place.be_blurb
            ? <span className="place-blurb-be" { ...mouse_attributes }>
                { place.be_blurb }
                </span>
            : null
            ; // eslint-disable-line indent

        if (render_data && !isNaN(render_data.top_margin)) {
            style.transform
                = `translateY(${ render_data.top_margin + top_padding }px)`
                ; // eslint-disable-line indent
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
                style={ style }
                { ...mouse_attributes }
                >
                <span className="place-title" { ...mouse_attributes }>
                    { place.title }
                    { ' ' }
                    <span className="place-subtitle" { ...mouse_attributes }>
                        { place.subtitle }
                    </span>
                </span>
                <div className="place-blurb" { ...mouse_attributes }>
                    { google_blurb }
                    { be_blurb }
                </div>
                { render_website() }
                <div className="place-details">
                    { render_address() }
                    { render_phone() }
                </div>
            </li>
            ); // eslint-disable-line indent

        // -----------

        function render_website() {
            if (!place.website_url) {
                return <span className="place-website"/>;
            }
            return (
                <a
                    className="place-website"
                    href={ place.website_url }
                    target="_blank"
                    >
                    { place.website_title || 'website' }
                </a>
                ); // eslint-disable-line indent
        }

        function render_phone() {
            if (!place.phone) {
                return null;
            }
            return (
                <a
                    href={ `tel:${ place.phone.replace(/\s/g, '') }` }
                    className="place-phone"
                    >
                    { place.phone }
                </a>
                ); // eslint-disable-line indent
        }

        function render_address() {
            if (!place.address) {
                return null;
            }
            const address = place.address.split('\n').map(
                (i) => <React.Fragment key={ i }>{ i }<br/></React.Fragment>,
                ); // eslint-disable-line indent
            return (
                <a
                    href={ place.google_maps_web_url }
                    target="_blank"
                    className="place-address"
                    >
                    { address }
                </a>
                ); // eslint-disable-line indent
        }
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
                place: {
                    google_place_id: place.google_place_id,
                    title: place.title,
                    }, // eslint-disable-line indent
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

    function scroll_nicely(element, scroll_to) {
        const this_component = this;
        const fps = 60; // frames per second
        const duration = 0.5; // in seconds
        const pixels_to_scroll
            = Math.abs(element.scrollTop - scroll_to) / duration / fps
            ; // eslint-disable-line indent
        this_component.scroll_timer
            && clearInterval(this_component.scroll_timer)
            ; // eslint-disable-line indent
        this_component.scroll_timer = setInterval(do_scrolling, 1000 / fps);
        return true;

        // -----------

        function do_scrolling() {
            // scroll up
            if (element.scrollTop > scroll_to) {
                const next_scroll_to = element.scrollTop - pixels_to_scroll;
                next_scroll_to < scroll_to
                    ? finish_scroll()
                    : element.scrollTop = next_scroll_to
                    ; // eslint-disable-line indent
            // scroll down
            } else if (element.scrollTop < scroll_to) {
                const next_scroll_to = element.scrollTop + pixels_to_scroll;
                next_scroll_to > scroll_to
                    ? finish_scroll()
                    : element.scrollTop = next_scroll_to
                    ; // eslint-disable-line indent
            } else {
                finish_scroll();
            }
        }

        function finish_scroll() {
            clearInterval(this_component.scroll_timer);
            element.scrollTop = scroll_to;
        }
    }

    // -----------

    function click_place_li(click_event) {
        const { path } = click_event.target.dataset;
        App.history.push({ path, query: { 'scroll?': false } });
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
            path: `/city/${ city.slug }/${ place.google_place_id }`,
            query: { 'pan?': false },
            page: {
                // eslint-disable-next-line max-len
                title: `⨳ Bonjour Explorer #BEin${ city.title } ⫸ ${ place.title }`,
                }, // eslint-disable-line indent
            }); // eslint-disable-line indent
    }

    function mouseout_marker(mouse_event) {
        const marker = mouse_event.target;
        const { place } = marker.options;
        this.props.google_place_id === place.google_place_id
            && this.activate_tooltip(marker)
            ; // eslint-disable-line indent
    }

    // -----------

    function activate_tooltip(raw_marker) {
        const marker = 'string' === typeof raw_marker
            ? this.place_markers.reduce(
                (r, m) => r
                    || m.options.place.google_place_id === raw_marker
                    && m,
                null,
                ) // eslint-disable-line indent
            : raw_marker
            ; // eslint-disable-line indent
        if (marker) {
            marker._icon.classList.add('active');
            marker.openTooltip();
        }
    }

    function deactivate_tooltip(raw_marker) {
        if (!raw_marker) {
            this.deactivate_all_tooltips();
        } else {
            const marker = 'string' === typeof raw_marker
                ? this.place_markers.reduce(
                    (r, m) => r
                        || m.options.place.google_place_id === raw_marker
                        && m,
                    null,
                    ) // eslint-disable-line indent
                : raw_marker
                ; // eslint-disable-line indent
            if (marker) {
                marker._icon.classList.remove('active');
                marker.closeTooltip();
            }
        }
    }

    function deactivate_all_tooltips() {
        for (const marker of this.place_markers) {
            const { place } = marker.options;
            if (place.google_place_id !== this.props.google_place_id) {
                marker._icon.classList.remove('active');
                marker.closeTooltip();
            }
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
