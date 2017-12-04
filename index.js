'use strict';

var PropTypes = require('prop-types');

var React = require('react'),
    search = require('./search');

/**
 * Geocoder component: connects to Mapbox.com Geocoding API
 * and provides an autocompleting interface for finding locations.
 */
class Geocoder extends React.Component {
  static displayName = 'Geocoder';

  static defaultProps = {
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

  static propTypes = {
    endpoint: PropTypes.string,
    source: PropTypes.string,
    inputClass: PropTypes.string,
    resultClass: PropTypes.string,
    resultsClass: PropTypes.string,
    inputPosition: PropTypes.string,
    inputPlaceholder: PropTypes.string,
    resultFocusClass: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    onSuggest: PropTypes.func,
    accessToken: PropTypes.string.isRequired,
    proximity: PropTypes.string,
    showLoader: PropTypes.bool,
    focusOnMount: PropTypes.bool
  };

  state = {
    results: [],
    focus: null,
    loading: false,
    searchTime: new Date()
  };

  componentDidMount() {
    if (this.props.focusOnMount) React.findDOMNode(this.refs.input).focus();
  }

  onInput = (e) => {
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
  };

  onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  moveFocus = (dir) => {
    if (this.state.loading) return;
    this.setState({
      focus: this.state.focus === null ? 0 : Math.max(0, Math.min(this.state.results.length - 1, this.state.focus + dir))
    });
  };

  acceptFocus = () => {
    if (this.state.focus !== null) {
      this.props.onSelect(this.state.results[this.state.focus]);
    }
  };

  onKeyDown = (e) => {
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
  };

  onResult = (err, res, body, searchTime) => {
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
  };

  clickOption = (place, listLocation) => {
    this.props.onSelect(place);
    this.setState({ focus: listLocation });
    // focus on the input after click to maintain key traversal
    // React.findDOMNode(this.refs.input).focus();
    return false;
  };

  render() {
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
}

module.exports = Geocoder;