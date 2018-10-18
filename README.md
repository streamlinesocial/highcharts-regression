Highcharts Regression
=====================

Linear and non-linear regression support for highcharts.
Allows you to add regression series to any existing series on your chart. 
Calculates the r-squared value (coefficient of determination) and optionally prints it on the legend.
If Linear or Polynomial regression is selected, you can print the equation on the legend.

For a basic usage just add this property to the series json

    regression: true

And for advanced configuration you can add options to 

    regressionSettings: {}
    
### Regression settings: 

##### `type ` (String)
Regression type: 'linear' ,'exponential', 'polynomial', 'power', 'logarithmic', 'loess'. Default: `linear`

##### `order` (Int)
Set the order (polynomial only). Default: `2`

##### `name` (String)
The name as it appears in the legend and tooltip. Use the following replacements:
* `%r`:  Value of [correlation coefficient][wiki-r]
* `%r2`: Value of [coefficient of determination][wiki-r2]
* `%eq`: Regression equation
* `%se`: Standard error
Default: `Equation: %eq`

##### `decimalPlaces` (Int)
Set the number of decimal places for r and r<sup>2</sup> (linear only). Default: `2`

##### `lineType` (String)
??. Default: `spline`

##### `lineWidth` (Int)
The width of the regression line. Default: `2`

##### `dashStyle` (String)
Use one of Highcharts-recognized dash styles. Default: `solid`

##### `color` (String)
Use one of Highcharts-recognized color definitions. Default: none.

##### `useAllSeries` (Boolean)
??. Default: `false`

##### `extrapolate` (Int)
??. Default: `0`

##### `loessSmooth` (Int)
??. Default: `25`

##### `visible` (Boolean)
Whether to show the line itself. Hiding the line will grey out its legend item. Default: `true`

##### `hideInLegend` (Boolean)
The opposite of `visible`: show the line but not its legend item. Default: `false`

##### `index` (Int)
The index of the series in the chart, affecting the internal index in the chart.series array, the visible Z index as well as the order in the legend. Default: `undefined`

##### `legendIndex` (Int)
The sequential index of the series in the legend. Default: `undefined`

##### `tooltip` (Object)
Stardard Highcharts [tooltip object](http://api.highcharts.com/highcharts/tooltip)

### Exposed properties:
The plugin exposes properties to `series[regressionSeries].options.regressionOutputs (Object)`
* `equation` (Array[Int]) individual parts of the regression equation
* `points` (Array)
* `rValue` (Int) [correlation coefficient][wiki-r]
* `rSquared` (Int) [coefficient of determination][wiki-r2]
* `standardError` (Int)
* `string` (String) the resulting formula in string format

###  Examples:
* [Basic default settings: linear regression with equation in the legend](http://jsfiddle.net/phpepe/q5jm4d7k/)
* [Polynomial regression - with extrapolation and different style](http://jsfiddle.net/phpepe/8457ctpj/)
* [Linear regression](http://jsfiddle.net/phpepe/3vruC/)
* [Loess regression 50% smooth](http://jsfiddle.net/phpepe/sMJv9/)
* [Linear regression with coeficient of determination](http://jsfiddle.net/phpepe/ofgpk5rp/)
* [Download resgression data on different formats](http://jsfiddle.net/gbsnpgdw/2/)
* http://jsfiddle.net/3g4ryLc9/
* http://jsfiddle.net/3g4ryLc9/2/
* http://jsfiddle.net/3g4ryLc9/5/
* [Drilldown support](http://jsfiddle.net/cmz25dtw/9/)
* [Regression enabled per series](http://jsfiddle.net/phpepe/ajp5mobc/)


[wiki-r]: https://en.wikipedia.org/wiki/Correlation_coefficient
[wiki-r2]: https://en.wikipedia.org/wiki/Coefficient_of_determination
