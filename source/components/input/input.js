// eslint-disable-next-line max-params
(function main(React) {
    'use strict';

    const AUTH_MODES = Object.freeze({
        EDITABLE: Symbol('editable'),
        READONLY: Symbol('readonly'),
        RESTRICTED: Symbol('restricted'), // Can see label, but value obscurred
        CENSORED: Symbol('censored'), // Label and value are obscurred
        HIDDEN: Symbol('hidden'), // Empty text node, no matter the props/state
    });

    const Input = React.createClass({
        propTypes: {
            auth_mode: React.PropTypes.symbol,
            label_text: React.PropTypes.string,
            is_required: React.PropTypes.bool,
            toggle_action: React.PropTypes.symbol,
            select_action: React.PropTypes.symbol,
            help_message: React.PropTypes.string,
            help_messages: React.PropTypes.array,
            error_message: React.PropTypes.string,
            error_messages: React.PropTypes.array,
        },

        getDefaultProps: init_input_props,
        getInitialState: init_input_state,
        setState: change_input_state,

        render: render_input,
    });
    Input.AUTH_MODES = AUTH_MODES;
    Input.is_valid_auth_mode = is_valid_auth_mode;

    return module.exports = Input;

    function is_valid_auth_mode(auth_mode) {
        for (const key in AUTH_MODES) {
            if (auth_mode === AUTH_MODES[key]) {
                return true;
            }
        }
        return false;
    }

    function init_input_props() {
        return {
            auth_mode: AUTH_MODES.EDITABLE,
            is_required: false,
            help_messages: [],
        };
    }

    function init_input_state(props) {
        return {
            help_messages: [], // in case an input has stateful help text
            error_messages: [],
        };
    }

    function change_input_state(previous_state, props) {
        const new_state = {};

        const help_messages = [];
        props.help_message
            && help_messages.push(String(props.help_message))
            ;
        props.help_messages
            && help_messages.push(...props.help_messages.map(String))
            ;
        0 !== help_messages.length
            && (new_state.help_messages = help_messages)
            ;

        const error_messages = [];
        props.error_message
            && error_messages.push(String(props.error_message))
            ;
        props.error_messages
            && error_messages.push(...props.error_messages.map(String))
            ;
        0 !== error_messages.length
            && (new_state.error_messages = error_messages)
            ;

        return new_state;
    }

    function render_input() {
        const props = this.props;
        const state = this.state;
        const auth_mode
            = -1 === Object.values(AUTH_MODES).indexOf(props.auth_mode)
                ? AUTH_MODES.EDITABLE
                : props.auth_mode
                ;

        switch (auth_mode) {
            case AUTH_MODES.READONLY:
                return render_readonly.call(this);
            case AUTH_MODES.RESTRICTED:
                return render_restricted.call(this);
            case AUTH_MODES.CENSORED:
                return render_censored.call(this);
            case AUTH_MODES.HIDDEN:
                return '';
        }

        const html_classes = [ 'input', `input-${ props.input_type_name }` ];
        props.is_required && html_classes.push('input-required');
        (state.error_message || 0 !== state.error_messages.length)
            && html_classes.push('input-error')
            ;
        props.toggle_action
            && html_classes.push(`input-toggle-${ props.toggle_action }`)
            ;
        props.select_action
            && html_classes.push(`input-select-${ props.select_action }`)
            ;

        return (
            <div className={ html_classes.join(' ') }>
                { render_messages.call(this, 'error') }
                <label className="input-body">
                    { /* label::before = toggle action button */ }
                    <span className="input-label-text">
                        { props.label_text }
                    </span>
                    { props.children }
                    { /* label::after = select action button */ }
                </label>
                { render_messages.call(this, 'help') }
            </div>
        );
    }

    function render_messages(message_kind) {
        const props = this.props;
        const state = this.state;
        if (AUTH_MODES.EDITABLE !== props.auth_mode) {
            return '';
        }

        const messages = [];
        const key = `${ message_kind }_messages`;
        0 !== state[key].length // stateful messages override stateless ones
            ? messages.push(...state[key].map(String))
            : props[key] && 0 !== props[key].length
                ? messages.push(...props[key].map(String))
                : messages // don't modify messages
            ;

        if (0 === messages.length) {
            return '';
        }
        return (
            <ul className={ `input-${ message_kind }-messages` }>
                { messages.map(render_message) }
            </ul>
        );

        function render_message(message, i) {
            return (
                <li key={ `input-${ message_kind }-message-${ i }` }
                    className={ `input-${ message_kind }-message` }
                    >
                    { message }
                </li>
            );
        }
    }

    function render_readonly() {
        const props = this.props;
        return (
            <div className="input input-readonly">
                <label className="input">
                    <span className="input-label-text">
                        { props.label_text }
                    </span>
                    { props.children }
                </label>
            </div>
        );
    }
    function render_restricted() {
        const props = this.props;
        return (
            <div className="input input-restricted">
                <label className="input">
                    <span className="input-label-text">
                        { props.label_text }
                    </span>
                    { render_obscurred_string({ min: 10, max: 15 }) }
                </label>
            </div>
        );
    }
    function render_censored() {
        return (
            <div className="input input-censored">
                <label className="input">
                    <span className="input-label-text">
                        { render_obscurred_string({ min: 5, max: 10 }) }
                    </span>
                    { render_obscurred_string({ min: 10, max: 15 }) }
                </label>
            </div>
        );
    }
    function render_obscurred_string(params) {
        return '░'.repeat(
            Math.floor(Math.random() * (params.max - params.min + 1))
                + params.min,
            );
    }
}(
    require('react'),
));
