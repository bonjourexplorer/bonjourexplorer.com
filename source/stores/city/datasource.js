// eslint-disable-next-line max-params
(function main(Mobx, cities) {
    return module.exports = Object.freeze({
        fill: fill_city_store,
    });

    // -----------

    function fill_city_store(city_store_mobx_array) {
        if (!Mobx.isObservableArray(city_store_mobx_array)) {
            throw new Error('City store must be a MobX ObservableArray');
        }
        city_store_mobx_array.replace(cities);
        return true;
    }
}(
    require('mobx'),
    require('../../static-data/cities.json'),
));
