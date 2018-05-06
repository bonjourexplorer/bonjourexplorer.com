// eslint-disable-next-line max-params
(function main(Mobx_react, React, City_store) {
    'use strict';

    // React component lifecycle
    //
    // Mount
    //     1. init_props          (getDefaultProps)
    //     2. init_state          (getInitialState)
    //     3. pre_mount           (componentWillMount)
    //     4. render
    //     5. post_mount          (componentDidMount)
    // Update state
    //     1. is_update_needed    (shouldComponentUpdate) // mobx ignores this
    //     2. pre_update          (componentWillUpdate)
    //     3. render
    //     4. post_update         (componentDidUpdate)
    // Update props
    //     1. pre_change_props    (componentWillReceiveProps)
    //     2. is_update_needed    (shouldComponentUpdate) // mobx ignores this
    //     3. pre_update          (componentWillUpdate)
    //     4. render
    //     5. post_update         (componentDidUpdate)
    // Unmount
    //     1. unmount             (componentWillUnmount)
    function City_selector(props) {
        React.Component(props); // eslint-disable-line new-cap
        this.state = init_state(props);
    }
    City_selector.prototype = new React.Component;
    City_selector.prototype.constructor = City_selector;
    City_selector.prototype.render = render;

    return module.exports = Mobx_react.observer(City_selector);



    function init_state(props) {
        return {
            cities: City_store.get_all(),
            selected_city_uid: undefined,
        };
    }

    function render() {
        const state = this.state;
        const options = state.cities.map(render_city);
        return (
            <select value={ state.selected_city_uid } className="city-selector">
                <option>Travel to...</option>
                { options }
            </select>
        );



        function render_city(city, index) {
            return (
                <option
                    key={ index }
                    value={ city.uid }
                    >
                    { city.name }
                </option>
            );
        }
    }

    // function handle_selector_change(event_) {
    //     const city_selector = this;
    //     city_selector.setState({ cities: City_store.cities });
    //     return true;
    // }
}(
    require('mobx-react'),
    require('react'),
    require('../../stores/city'),
));
