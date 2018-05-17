// eslint-disable-next-line max-params
(function main(Mobx, Place_datasource) {
    const NULL_PLACE = { get: () => null };
    const places = Mobx.observable({
        atlanta: [],
        denver: [],
        paris: [],
        }); // eslint-disable-line indent
    Place_datasource.fill(places);

    const place_store = Object.create({}, {
        find: { value: find_place },
        get_all_in_city: { value: get_all_places_in_city },
        }); // eslint-disable-line
    return module.exports = Object.freeze(place_store);

    // -----------

    function find_place(arg) {
        if (!arg) {
            return NULL_PLACE;
        }
        let find_by_params;
        switch (typeof arg) {
            case 'string':
                find_by_params = { field: 'google_place_id', value: arg };
                break;
            default:
                throw new Error(
                    'Use a string (google_place_id) to get a place',
                    );
        }
        return find_place_by(find_by_params);
    }

    function find_place_by(params) {
        return Mobx.computed(compute_place_by);

        // -----------

        function compute_place_by() {
            for (const city of Object.keys(places)) {
                for (const place of places[city]) {
                    if (params.value === place[ params.field ]) {
                        return place;
                    }
                }
            }
            return null;
        }
    }

    function get_all_places_in_city(city_slug) {
        return places[city_slug];
    }
}(
    require('mobx'),
    require('./datasource'),
));
