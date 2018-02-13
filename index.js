'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PropTypes = require('prop-types');

var React = require('react'),
    search = require('./search');

/**
 * Geocoder component: connects to Mapbox.com Geocoding API
 * and provides an autocompleting interface for finding locations.
 */

var Geocoder = function (_React$Component) {
  _inherits(Geocoder, _React$Component);

  function Geocoder() {
    var _ref;

    var _temp, _this2, _ret;

    _classCallCheck(this, Geocoder);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = Geocoder.__proto__ || Object.getPrototypeOf(Geocoder)).call.apply(_ref, [this].concat(args))), _this2), _this2.onInput = function (e) {
      _this2.setState({ loading: true });
      var value = e.target.value;
      if (value === '') {
        _this2.setState({
          results: [],
          focus: null,
          loading: false
        });
      } else {
        search(_this2.props.endpoint, _this2.props.source, _this2.props.accessToken, _this2.props.proximity, value, _this2.onResult);
      }
    }, _this2.onSubmit = function (e) {
      e.preventDefault();
      e.stopPropagation();
    }, _this2.moveFocus = function (dir) {
      if (_this2.state.loading) return;
      _this2.setState({
        focus: _this2.state.focus === null ? 0 : Math.max(0, Math.min(_this2.state.results.length - 1, _this2.state.focus + dir))
      });
    }, _this2.acceptFocus = function () {
      if (_this2.state.focus !== null) {
        _this2.props.onSelect(_this2.state.results[_this2.state.focus]);
      }
    }, _this2.onKeyDown = function (e) {
      switch (e.which) {
        // up
        case 38:
          e.preventDefault();
          _this2.moveFocus(-1);
          break;
        // down
        case 40:
          _this2.moveFocus(1);
          break;
        // accept
        case 13:
          if (_this2.state.results.length > 0 && _this2.state.focus == null) {
            _this2.clickOption(_this2.state.results[0], 0);
          }
          _this2.acceptFocus();
          break;
      }
    }, _this2.onResult = function (err, res, body, searchTime) {
      // searchTime is compared with the last search to set the state
      // to ensure that a slow xhr response does not scramble the
      // sequence of autocomplete display.
      if (!err && body && body.features && _this2.state.searchTime <= searchTime) {
        _this2.setState({
          searchTime: searchTime,
          loading: false,
          results: body.features,
          focus: null
        });
        _this2.props.onSuggest(_this2.state.results);
      }
    }, _this2.clickOption = function (place, listLocation) {
      _this2.props.onSelect(place);
      _this2.setState({ focus: listLocation });
      // focus on the input after click to maintain key traversal
      // React.findDOMNode(this.refs.input).focus();
      return false;
    }, _temp), _possibleConstructorReturn(_this2, _ret);
  }

  _createClass(Geocoder, [{
    key: 'getInitialState',
    value: function getInitialState() {
      return {
        results: [],
        focus: null,
        loading: false,
        searchTime: new Date()
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.focusOnMount) React.findDOMNode(this.refs.input).focus();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var input = React.createElement('input', {
        ref: 'input',
        className: this.props.inputClass,
        onInput: this.onInput,
        onKeyDown: this.onKeyDown,
        onSubmit: this.onSubmit,
        placeholder: this.props.inputPlaceholder,
        type: 'text' });
      return React.createElement('div', null, this.props.inputPosition === 'top' && input, this.state.results.length > 0 && React.createElement('ul', { className: (this.props.showLoader && this.state.loading ? 'loading' : '') + ' ' + this.props.resultsClass }, this.state.results.map(function (result, i) {
        return React.createElement('li', { key: result.id }, React.createElement('a', { onClick: _this.clickOption.bind(_this, result, i),
          className: _this.props.resultClass + ' ' + (i === _this.state.focus ? _this.props.resultFocusClass : ''),
          key: result.id }, result.place_name));
      })), this.props.inputPosition === 'bottom' && input);
    }
  }]);

  return Geocoder;
}(React.Component);

Geocoder.propTypes = {
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

Geocoder.defaultProps = {
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

module.exports = Geocoder;