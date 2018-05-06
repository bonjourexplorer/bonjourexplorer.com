// eslint-disable-next-line max-params
(function main(React, Input) {
    'use strict';

    // React component lifecycle
    // Mount - responds to props and state
    //     1. init_props          (getDefaultProps)
    //     2. init_state          (getInitialState)
    //     3. pre_mount           (componentWillMoun)
    //     4. render
    //     5. post_mount          (componentDidMount)
    // Update - responds to state but not props
    //     1. pre_change_state    (componentWillReceiveProps)
    //     2. change_state        (setState)
    //     3. is_update_needed    (shouldComponentUpdate)
    //     4. pre_update          (componentWillUpdate)
    //     5. render
    //     6. post_update         (componentDidUpdate)
    // Unmount
    //     1. unmount             (componentWillUnmount)

    const Input_text = React.createClass({
        propTypes: {
            auth_mode: React.PropTypes.symbol,
            label_text: React.PropTypes.string,
            is_required: React.PropTypes.bool,
            help_message: React.PropTypes.string,
            help_messages: React.PropTypes.array,
        },

        getDefaultProps: init_props,
        getInitialState: init_state,

        // componentWillReceiveProps: pre_change_state,
        setState: change_state,

        render,

        // componentWillMount: pre_mount,
        // componentDidMount: post_mount,

        // shouldComponentUpdate: is_update_needed,
        // componentWillUpdate: pre_update,
        // componentDidUpdate: post_update,

        // componentWillUnmount: unmount,
    });

    return module.exports = Input_text;

    function init_props() {
        // const initial_props = {
        //     input_type_name: 'text',
        // };
        // initial_props.auth_mode
        //     = -1 === Object.values(Input.AUTH_MODES).indexOf(props.auth_mode)
        //         ? Input.AUTH_MODES.EDITABLE
        //         : props.auth_mode
        //         ;
        return {
            auth_mode: Input.AUTH_MODES.EDITABLE,
            input_type_name: 'text',
            is_required: false,
        };
    }

    function init_state() {
        const props = this.props;
        return {
            value: props.value || '',
            help_messages: [],
            error_messages: [],
        };
    }

    // eslint-disable-next-line
    function change_state(previous_state, props) {
        const new_state = {};
        return new_state;
    }

    function render() {
        const props = this.props;
        const state = this.state;

        return (
            <Input>
                <input type="text"
                    placeholder={ props.placeholder }
                    value={ state.value }
                    />
            </Input>
        );
    }
}(
    require('react'),
    require('../input'),
));
