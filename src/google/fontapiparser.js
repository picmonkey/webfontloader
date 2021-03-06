/**
 * @constructor
 */
webfont.FontApiParser = function(fontFamilies) {
  this.fontFamilies_ = fontFamilies;
  this.parsedFontFamilies_ = [];
  this.variations_ = {};
  this.fontTestStrings_ = {};
  this.fvd_ = new webfont.FontVariationDescription();
};


webfont.FontApiParser.INT_FONTS = {
  'latin': webfont.FontWatchRunner.DEFAULT_TEST_STRING,
  'cyrillic': '&#1081;&#1103;&#1046;',
  'greek': '&#945;&#946;&#931;',
  'khmer': '&#x1780;&#x1781;&#x1782;',
  'Hanuman': '&#x1780;&#x1781;&#x1782;' // For backward compatibility
};

webfont.FontApiParser.WEIGHTS = {
  'thin': '1',
  'extralight': '2',
  'extra-light': '2',
  'ultralight': '2',
  'ultra-light': '2',
  'light': '3',
  'regular': '4',
  'book': '4',
  'medium': '5',
  'semi-bold': '6',
  'semibold': '6',
  'demi-bold': '6',
  'demibold': '6',
  'bold': '7',
  'extra-bold': '8',
  'extrabold': '8',
  'ultra-bold': '8',
  'ultrabold': '8',
  'black': '9',
  'heavy': '9',
  'l': '3',
  'r': '4',
  'b': '7'
};

webfont.FontApiParser.STYLES = {
  'i': 'i',
  'italic': 'i',
  'n': 'n',
  'normal': 'n'
};

webfont.FontApiParser.VARIATION_MATCH =
    new RegExp("^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|" +
        "(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i" +
        "|normal|italic)?$");

webfont.FontApiParser.prototype.parse = function() {
  var length = this.fontFamilies_.length;

  for (var i = 0; i < length; i++) {
    var elements = this.fontFamilies_[i].split(":");
    var fontFamily = elements[0].replace(/\+/g, " ");
    var variations = ['n4'];

    if (elements.length >= 2) {
      var fvds = this.parseVariations_(elements[1]);

      if (fvds.length > 0) {
        variations = fvds;
      }
      if (elements.length == 3) {
        var subsets = this.parseSubsets_(elements[2]);
        if (subsets.length > 0) {
          var fontTestString = webfont.FontApiParser.INT_FONTS[subsets[0]];

          if (fontTestString) {
	    this.fontTestStrings_[fontFamily] = fontTestString;
	  }
	}
      }
    }

    // For backward compatibility
    if (!this.fontTestStrings_[fontFamily]) {
      var hanumanTestString = webfont.FontApiParser.INT_FONTS[fontFamily];
      if (hanumanTestString) {
        this.fontTestStrings_[fontFamily] = hanumanTestString;
      }
    }
    this.parsedFontFamilies_.push(fontFamily);
    this.variations_[fontFamily] = variations;
  }
};

webfont.FontApiParser.prototype.generateFontVariationDescription_ = function(variation) {
  if (!variation.match(/^[\w]+$/)) {
    return '';
  }
  var normalizedVariation = variation.toLowerCase();
  var groups = webfont.FontApiParser.VARIATION_MATCH.exec(normalizedVariation);
  if (groups == null) {
    return '';
  }
  var styleMatch = this.normalizeStyle_(groups[2]);
  var weightMatch = this.normalizeWeight_(groups[1]);
  var css = this.fvd_.expand([styleMatch, weightMatch].join(''));
  return css ? this.fvd_.compact(css) : null;
};


webfont.FontApiParser.prototype.normalizeStyle_ = function(parsedStyle) {
  if (parsedStyle == null) {
    return 'n';
  }
  return webfont.FontApiParser.STYLES[parsedStyle];
};


webfont.FontApiParser.prototype.normalizeWeight_ = function(parsedWeight) {
  if (parsedWeight == null) {
    return '4';
  }
  var weight = webfont.FontApiParser.WEIGHTS[parsedWeight];
  if (weight) {
    return weight;
  }
  if (isNaN(parsedWeight)) {
    return '4';
  }
  return parsedWeight.substr(0, 1);
};


webfont.FontApiParser.prototype.parseVariations_ = function(variations) {
  var finalVariations = [];

  if (!variations) {
    return finalVariations;
  }
  var providedVariations = variations.split(",");
  var length = providedVariations.length;

  for (var i = 0; i < length; i++) {
    var variation = providedVariations[i];
    var fvd = this.generateFontVariationDescription_(variation);

    if (fvd) {
      finalVariations.push(fvd);
    }
  }
  return finalVariations;
};


webfont.FontApiParser.prototype.parseSubsets_ = function(subsets) {
  var finalSubsets = [];

  if (!subsets) {
    return finalSubsets;
  }
  return subsets.split(",");
};


webfont.FontApiParser.prototype.getFontFamilies = function() {
  return this.parsedFontFamilies_;
};

webfont.FontApiParser.prototype.getVariations = function() {
  return this.variations_;
};

webfont.FontApiParser.prototype.getFontTestStrings = function() {
  return this.fontTestStrings_;
};
