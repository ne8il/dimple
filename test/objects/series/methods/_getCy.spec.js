/*global expect, describe, it, beforeEach, spyOn */
(function () {
    "use strict";

    describe("dimple.series._getCy", function() {

        var seriesUnderTest = null,
            // Mock return values as ascending primes to avoid coincidental passes
            unscaledValue = 2,
            scaleReturn = 3,
            innerBarCount = 7,
            offset = 11,
            barGap = 13,
            pointSize = 17,
            barSize = 19;

        beforeEach(function () {
            // The axis to return mock values while testing
            var mockAxis = jasmine.createSpyObj("axis spy", [
                "_hasMeasure",
                "_hasCategories",
                "_hasMultipleCategories",
                "_hasTimeField",
                "_scaleValue",
                "_pointSize"
            ]);
            // These will be individually overridden in tests to mock different axis types
            mockAxis._hasMeasure.andReturn(false);
            mockAxis._hasCategories.andReturn(false);
            mockAxis._hasMultipleCategories.andReturn(false);
            mockAxis._hasTimeField.andReturn(false);
            // Set the return type dimensions
            mockAxis._scaleValue.andReturn(scaleReturn);
            mockAxis._pointSize.andReturn(pointSize);

            // Instantiate the series to test
            seriesUnderTest = new dimple.Series();
            seriesUnderTest.y = mockAxis;

            // Set up series mocks
            spyOn(seriesUnderTest, "_getBarGap").andReturn(barGap);
            spyOn(seriesUnderTest, "_getBarSize").andReturn(barSize);

            // Set up validation spies
            spyOn(dimple.validation, "_isDefined").andReturn(true);
            spyOn(dimple.validation, "_isNumber").andReturn(true);
            spyOn(dimple.validation, "_isPositiveNumber").andReturn(true);

        });

        it("Validates required members", function () {
            try {
                seriesUnderTest._getCy(unscaledValue);
            } catch (ignore) {
                /* validation is not under test */
            }
            expect(dimple.validation._isDefined).toHaveBeenCalledWith("y axis", seriesUnderTest.y);
        });

        it("Validates required parameters", function () {
            try {
                seriesUnderTest._getCy(unscaledValue);
            } catch (ignore) { /* validation is not under test */ }
            expect(dimple.validation._isDefined).toHaveBeenCalledWith("unscaledValue", unscaledValue);
        });

        it("Does not validate optional parameters for axes other than multiple category", function() {
            try {
                seriesUnderTest._getCy(unscaledValue, innerBarCount, offset);
            } catch (ignore) {
                /* validation is not under test */
            }
            expect(dimple.validation._isPositiveNumber).not.toHaveBeenCalled();
        });

        it("Validates optional parameters for multiple category axes", function() {
            seriesUnderTest.y._hasMultipleCategories.andReturn(true);
            try {
                seriesUnderTest._getCy(unscaledValue, innerBarCount, offset);
            } catch (ignore) {
                /* validation is not under test */
            }
            expect(dimple.validation._isPositiveNumber).toHaveBeenCalledWith("innerBarCount", innerBarCount);
            expect(dimple.validation._isPositiveNumber).toHaveBeenCalledWith("offset", offset);
        });

        it("Throws an exception if axis returns false for all types", function() {
            expect(function () { seriesUnderTest._getCy(unscaledValue); })
                .toThrow(dimple.exception.unsupportedAxisState("y"));
            expect(seriesUnderTest.y._hasMeasure).toHaveBeenCalled();
            expect(seriesUnderTest.y._hasCategories).toHaveBeenCalled();
            expect(seriesUnderTest.y._hasMultipleCategories).toHaveBeenCalled();
            expect(seriesUnderTest.y._hasTimeField).toHaveBeenCalled();
        });

        it("Uses the y axis scaling for measure axes", function() {
            seriesUnderTest.y._hasMeasure.andReturn(true);
            expect(seriesUnderTest._getCy(unscaledValue)).toEqual(scaleReturn);
            expect(seriesUnderTest.y._hasMeasure).toHaveBeenCalled();
            expect(seriesUnderTest.y._scaleValue).toHaveBeenCalledWith(unscaledValue);
        });

        it("Uses the y axis scaling for time axes", function() {
            seriesUnderTest.y._hasTimeField.andReturn(true);
            expect(seriesUnderTest._getCy(unscaledValue)).toEqual(scaleReturn);
            expect(seriesUnderTest.y._hasTimeField).toHaveBeenCalled();
            expect(seriesUnderTest.y._scaleValue).toHaveBeenCalledWith(unscaledValue);
        });

        it("Calculates middle bar position for multiple categories", function() {
            seriesUnderTest.y._hasMultipleCategories.andReturn(true);
            expect(seriesUnderTest._getCy(unscaledValue, innerBarCount, offset))
                .toEqual(scaleReturn - pointSize + barGap + (offset + 0.5) * (barSize / innerBarCount));
            expect(seriesUnderTest.y._hasMultipleCategories).toHaveBeenCalled();
            expect(seriesUnderTest.y._scaleValue).toHaveBeenCalledWith(unscaledValue);
            expect(seriesUnderTest._getBarGap).toHaveBeenCalled();
            expect(seriesUnderTest._getBarSize).toHaveBeenCalled();
            expect(seriesUnderTest.y._pointSize).toHaveBeenCalled();
        });

        it("Calculates middle bar position for single categories", function() {
            seriesUnderTest.y._hasCategories.andReturn(true);
            expect(seriesUnderTest._getCy(unscaledValue))
                .toEqual(scaleReturn - pointSize / 2);
            expect(seriesUnderTest.y._hasCategories).toHaveBeenCalled();
            expect(seriesUnderTest.y._scaleValue).toHaveBeenCalledWith(unscaledValue);
            expect(seriesUnderTest.y._pointSize).toHaveBeenCalled();
        });

    });

}());