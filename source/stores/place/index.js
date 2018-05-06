// eslint-disable-next-line max-params
(function main(Mobx, Place_datasource) {
    const places = Mobx.observable({
        atlanta: [],
        denver: [],
        paris: [],
        }); // eslint-disable-line indent
    Place_datasource.fill(places);

    const place_store = Object.create({}, {
        get_all_in_city: { value: get_all_places_in_city },
        }); // eslint-disable-line
    return module.exports = Object.freeze(place_store);

    // -----------

    function get_all_places_in_city(city_slug) {
        return places[city_slug];
    }
}(
    require('mobx'),
    require('./datasource'),
));
