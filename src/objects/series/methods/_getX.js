// Copyright: 2014 PMSI-AlignAlytics
// License: "https://github.com/PMSI-AlignAlytics/dimple/blob/master/MIT-LICENSE.txt"
// Source: /src/objects/series/methods/_getX.js
// Tests: /test/objects/series/methods/_getX.spec.js
(function () {
    "use strict";
    /**
     * Calculate the physical top-left x co-ordinate for the passed unscaled value.
     * @param {string} unscaledValue - The logical x value to be converted to a physical value.  It could be a string for category axes or a number for measure axes.
     * @param {number} [innerBarCount] - The number of small bars within a bar group.  This is only required for multiple category axes.
     * @param {number} [offset] - The zero based index of an inner bar within a bar group.  This is only required for multiple category axes.
     * @return {number} - The physical top-left x co-ordinate.
     */
    dimple.Series.prototype._getX = function (unscaledValue, innerBarCount, offset) {
        var returnX = 0;
        // Validate the axis
        dimple.validation._isDefined("x axis", this.x);
        dimple.validation._isDefined("unscaledValue", unscaledValue);
        // Handle the return type based on axis type
        if (this.x._hasTimeField()) {
            // Centre on the x value rather than return top left
            returnX = this.x._scaleValue(unscaledValue) - (this.x.floatingBarWidth / 2);
        } else if (this.x._hasMeasure()) {
            // Simply return the scaled value
            returnX = this.x._scaleValue(unscaledValue);
        } else if (this.x._hasMultipleCategories()) {
            // For multiple categories the second two parameters are required
            dimple.validation._isPositiveNumber("innerBarCount", innerBarCount);
            dimple.validation._isPositiveNumber("offset", offset);
            // Scale to get the left position of the bar and add half the bar size to get the centre
            returnX = this.x._scaleValue(unscaledValue) + this._getBarGap("x") + offset * (this._getBarSize("x") / innerBarCount);
        } else if (this.x._hasCategories()) {
            // Scale to get the left position of the bar and add half the bar size to get the centre
            returnX = this.x._scaleValue(unscaledValue) + this._getBarGap("x");
        } else {
            throw dimple.exception.unsupportedAxisState("x");
        }
        return returnX;
    };
}());