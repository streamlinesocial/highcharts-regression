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
    
#### Regression settings: 

* `type ` (String) Regression type: 'linear' ,'exponential', 'polynomial', 'logarithmic', 'loess' 
* `order` (Int) If regression type is polynomial set the order


####  Examples:
* [Basic default settings: linear regression with equation in the legend](http://jsfiddle.net/phpepe/q5jm4d7k/)
* [Polynomial regression - with extrapolation and different style](http://jsfiddle.net/phpepe/8457ctpj/)
* [Linear regression](http://jsfiddle.net/phpepe/3vruC/)
* [Loess regression 50% smooth](http://jsfiddle.net/phpepe/sMJv9/)
* [Linear regression with coeficient of determination](http://jsfiddle.net/phpepe/ofgpk5rp/)
* http://jsfiddle.net/3g4ryLc9/
* http://jsfiddle.net/3g4ryLc9/2/
* http://jsfiddle.net/3g4ryLc9/5/


