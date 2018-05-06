// eslint-disable-next-line max-params
(function main(Mobx, City_datasource) {
    'use strict';

    const cities = Mobx.observable([]);
    City_datasource.fill(cities);

    const city_store = Object.create({}, {
        find: { value: find_city },
        get_all: { value: get_all_cities },
        }); // eslint-disable-line
    return module.exports = Object.freeze(city_store);

    // -----------

    function find_city(arg) {
        if (!arg) {
            return null;
        }
        let find_by_params;
        switch (typeof arg) {
            case 'string':
                find_by_params = { field: 'slug', value: arg };
                break;
            case 'number':
                find_by_params = { field: 'id', value: arg };
                break;
            default:
                throw new Error(
                    'Use a string (slug) or number (id) to get a city',
                    );
        }
        return find_city_by(find_by_params);
    }

    function find_city_by(params) {
        return Mobx.computed(compute_city_by);

        // -----------

        function compute_city_by() {
            for (let i = 0, n = cities.length - 1; i <= n; i++) {
                const city = cities[i];
                if (params.value === city[ params.field ]) {
                    return city;
                }
            }
            return null;
        }
    }

    function get_all_cities() {
        return cities;
    }
}(
    require('mobx'),
    require('./datasource'),
));
