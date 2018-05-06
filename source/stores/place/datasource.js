// eslint-disable-next-line max-params
(function main(Mobx, city_places) {
    return module.exports = Object.freeze({
        fill: fill_place_store,
        }); // eslint-disable-line

    // -----------

    function fill_place_store(place_store_mobx_dict) {
        if (!Mobx.isObservableObject(place_store_mobx_dict)) {
            throw new Error('Place store must be a MobX Observable Object');
        }
        place_store_mobx_dict.atlanta.replace(city_places.atlanta);
        place_store_mobx_dict.denver.replace(city_places.denver);
        place_store_mobx_dict.paris.replace(city_places.paris);
        return true;
    }
}(
    require('mobx'),
    {
        atlanta: require('../../static-data/atlanta.json'),
        denver: require('../../static-data/denver.json'),
        paris: require('../../static-data/paris.json'),
    },
));
