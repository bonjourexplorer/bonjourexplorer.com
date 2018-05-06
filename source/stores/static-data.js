// eslint-disable-next-line max-params
(function main(axios) {
    return module.exports = Object.freeze({
        fetch_cities,
        fetch_places,
        }); // eslint-disable-line indent

    // -----------

    function fetch_cities() {
        return axios('/static-data/cities.json');
    }

    function fetch_places(city_slug) {
        return axios(`/static-data/${ city_slug }.json`);
    }
}(
    require('axios'),
));
