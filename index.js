'use strict';

var React = require('react'),
    search = require('./search');

/**
 * Geocoder component: connects to Mapbox.com Geocoding API
 * and provides an autocompleting interface for finding locations.
 */
var Geocoder = React.createClass({
  displayName: 'Geocoder',
  getDefaultProps: function getDefaultProps() {
    return {
      endpoint: 'https://api.tiles.mapbox.com',
      inputClass: '',
      resultClass: '',
      resultsClass: '',
      resultFocusClass: 'strong',
      inputPosition: 'top',
      inputPlaceholder: 'Search',
      showLoader: false,
      source: 'mapbox.places',
      proximity: '',
      onSuggest: function onSuggest() {},
      focusOnMount: true
    };
  },
  getInitialState: function getInitialState() {
    return {
      results: [],
      focus: null,
      loading: false,
      searchTime: new Date()
    };
  },

  propTypes: {
    endpoint: React.PropTypes.string,
    source: React.PropTypes.string,
    inputClass: React.PropTypes.string,
    resultClass: React.PropTypes.string,
    resultsClass: React.PropTypes.string,
    inputPosition: React.PropTypes.string,
    inputPlaceholder: React.PropTypes.string,
    resultFocusClass: React.PropTypes.string,
    onSelect: React.PropTypes.func.isRequired,
    onSuggest: React.PropTypes.func,
    accessToken: React.PropTypes.string.isRequired,
    proximity: React.PropTypes.string,
    showLoader: React.PropTypes.bool,
    focusOnMount: React.PropTypes.bool
  },
  componentDidMount: function componentDidMount() {
    if (this.props.focusOnMount) React.findDOMNode(this.refs.input).focus();
  },
  onInput: function onInput(e) {
    this.setState({ loading: true });
    var value = e.target.value;
    if (value === '') {
      this.setState({
        results: [],
        focus: null,
        loading: false
      });
    } else {
      search(this.props.endpoint, this.props.source, this.props.accessToken, this.props.proximity, value, this.onResult);
    }
  },
  onSubmit: function onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
  },
  moveFocus: function moveFocus(dir) {
    if (this.state.loading) return;
    this.setState({
      focus: this.state.focus === null ? 0 : Math.max(0, Math.min(this.state.results.length - 1, this.state.focus + dir))
    });
  },
  acceptFocus: function acceptFocus() {
    if (this.state.focus !== null) {
      this.props.onSelect(this.state.results[this.state.focus]);
    }
  },
  onKeyDown: function onKeyDown(e) {
    switch (e.which) {
      // up
      case 38:
        e.preventDefault();
        this.moveFocus(-1);
        break;
      // down
      case 40:
        this.moveFocus(1);
        break;
      // accept
      case 13:
        if (this.state.results.length > 0 && this.state.focus == null) {
          this.clickOption(this.state.results[0], 0);
        }
        this.acceptFocus();
        break;
    }
  },
  onResult: function onResult(err, res, body, searchTime) {
    // searchTime is compared with the last search to set the state
    // to ensure that a slow xhr response does not scramble the
    // sequence of autocomplete display.
    if (!err && body && body.features && this.state.searchTime <= searchTime) {
      this.setState({
        searchTime: searchTime,
        loading: false,
        results: body.features,
        focus: null
      });
      this.props.onSuggest(this.state.results);
    }
  },
  clickOption: function clickOption(place, listLocation) {
    this.props.onSelect(place);
    this.setState({ focus: listLocation });
    // focus on the input after click to maintain key traversal
    // React.findDOMNode(this.refs.input).focus();
    return false;
  },
  render: function render() {
    var _this = this;

    var input = React.createElement('input', {
      ref: 'input',
      className: this.props.inputClass,
      onInput: this.onInput,
      onKeyDown: this.onKeyDown,
      onSubmit: this.onSubmit,
      placeholder: this.props.inputPlaceholder,
      type: 'text' });
    return React.createElement(
      'div',
      null,
      this.props.inputPosition === 'top' && input,
      this.state.results.length > 0 && React.createElement(
        'ul',
        { className: (this.props.showLoader && this.state.loading ? 'loading' : '') + ' ' + this.props.resultsClass },
        this.state.results.map(function (result, i) {
          return React.createElement(
            'li',
            { key: result.id },
            React.createElement(
              'a',
              { onClick: _this.clickOption.bind(_this, result, i),
                className: _this.props.resultClass + ' ' + (i === _this.state.focus ? _this.props.resultFocusClass : ''),
                key: result.id },
              result.place_name
            )
          );
        })
      ),
      this.props.inputPosition === 'bottom' && input
    );
  }
});

module.exports = Geocoder;