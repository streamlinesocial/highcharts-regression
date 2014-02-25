(function (H) {
	

    H.wrap(H.Chart.prototype, 'init', function (proceed) {
    	var series = arguments[1].series ;
    	var extraSeries = [];
    	var i = 0 ;
    	for (i = 0 ; i < series.length ; i++){
    		var s = series[i];
    		if ( s.regression  ) {
    			s.regressionSettings =  s.regressionSettings || {} ;
    			var regressionType = s.regressionSettings.type || "linear" ;
    			
    			//console.debug(_extraSerie);
    			var extraSerie = {data:[]};
    			var regression; 
    			
    			
    			extraSerie.color = s.color ;
    			extraSerie.yAxis = s.yAxis ;
    			extraSerie.lineWidth = 2;
    			extraSerie.marker = {enabled: false} ;
                //extraSerie.enableMouseTracking = false ;
                extraSerie.isRegressionLine = true;
                if (regressionType == "linear") {
                	regression = _linear(s.data) ;
        			extraSerie.data = regression.points ;
        			regression.correlation = Math.abs(	parseFloat(regression.correlation).toFixed(2) ) ;
	                extraSerie.tooltip = {
	                    pointFormat: '{series.name}: <b>{point.y}</b><br/>R value: <b>'+ regression.correlation+'</b><br/>R squared: <b>'+ Math.pow(regression.correlation,2).toFixed(2)+'</b><br/>',
	                }
                }else if (regressionType == "exponential") {
                	regression = _exponential(s.data) 
        			extraSerie.data = regression.points ;
                }else if (regressionType == "polynomial"){
                	regression = _polynomial(s.data, 4) ;
                	extraSerie.data = regression.points ;
                }else if (regressionType == "logarithmic"){
                	regression = _logarithmic(s.data) ;
                	extraSerie.data = regression.points ;
                }else {
                	console.error("Invalid regression type: " , regressionType) ;
                }
                if (s.regressionSettings) {
	    			if (s.regressionSettings.color) {
	    				extraSerie.color = s.regressionSettings.color ;
	    			}
	    			if (s.regressionSettings.label) {
	    				extraSerie.name = s.regressionSettings.label ;
	    			}
                }
                
                extraSerie.regressionOutputs = regression ;
                console.debug("regression",regression);
    			extraSeries.push(extraSerie) ;
    		}
    	}

    	arguments[1].series = series.concat(extraSeries);
    	proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        
    });
    

	
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
	function _exponential(data) {
        var sum = [0, 0, 0, 0, 0, 0], n = 0, results = [];

        for (len = data.length; n < len; n++) {
          if (data[n][1]) {
            sum[0] += data[n][0];
            sum[1] += data[n][1];
            sum[2] += data[n][0] * data[n][0] * data[n][1];
            sum[3] += data[n][1] * Math.log(data[n][1]);
            sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]);
            sum[5] += data[n][0] * data[n][1];
          }
        }

        var denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
        var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
        var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

        for (var i = 0, len = data.length; i < len; i++) {
            var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
            results.push(coordinate);
        }

        var string = 'y = ' + Math.round(A*100) / 100 + 'e^(' + Math.round(B*100) / 100 + 'x)';

        return {equation: [A, B], points: results, string: string};
	} 
	
	
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
	function _linear(data) {
        var sum = [0, 0, 0, 0, 0], n = 0, results = [];

        for (; n < data.length; n++) {
          if (data[n][1]) {
            sum[0] += data[n][0]; //X 
            sum[1] += data[n][1]; //SUM(Y)
            sum[2] += data[n][0] * data[n][0]; //XX
            sum[3] += data[n][0] * data[n][1]; //XY
            sum[4] += data[n][1] * data[n][1]; //YY
          }
        }

        var gradient = (n * sum[3] - sum[0] * sum[1]) / (n * sum[2] - sum[0] * sum[0]);
        var intercept = (sum[1] / n) - (gradient * sum[0]) / n;
        var correlation = (n * sum[3] - sum[0] * sum[1]) / Math.sqrt((n * sum[2] - sum[0] * sum[0]) * (n * sum[4] - sum[1] * sum[1]));
        var mean = sum[1] / n ;
        for (var i = 0, len = data.length; i < len; i++) {
            var coordinate = [data[i][0], data[i][0] * gradient + intercept];
            results.push(coordinate);
        }

        var string = 'y = ' + Math.round(gradient*100) / 100 + 'x + ' + Math.round(intercept*100) / 100;
        return {equation: [gradient, intercept], points: results, string: string, correlation: correlation, mean: mean};
	}
	
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
	function _logarithmic(data) {
        var sum = [0, 0, 0, 0], n = 0, results = [];

        for (len = data.length; n < len; n++) {
          if (data[n][1]) {
            sum[0] += Math.log(data[n][0]);
            sum[1] += data[n][1] * Math.log(data[n][0]);
            sum[2] += data[n][1];
            sum[3] += Math.pow(Math.log(data[n][0]), 2);
          }
        }

        var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
        var A = (sum[2] - B * sum[0]) / n;

        for (var i = 0, len = data.length; i < len; i++) {
            var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
            results.push(coordinate);
        }

        var string = 'y = ' + Math.round(A*100) / 100 + ' + ' + Math.round(B*100) / 100 + ' ln(x)';

        return {equation: [A, B], points: results, string: string};
    }
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
	function _power(data) {
        var sum = [0, 0, 0, 0], n = 0, results = [];

        for (len = data.length; n < len; n++) {
          if (data[n][1]) {
            sum[0] += Math.log(data[n][0]);
            sum[1] += Math.log(data[n][1]) * Math.log(data[n][0]);
            sum[2] += Math.log(data[n][1]);
            sum[3] += Math.pow(Math.log(data[n][0]), 2);
          }
        }

        var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
        var A = Math.pow(Math.E, (sum[2] - B * sum[0]) / n);

        for (var i = 0, len = data.length; i < len; i++) {
            var coordinate = [data[i][0], A * Math.pow(data[i][0] , B)];
            results.push(coordinate);
        }

         var string = 'y = ' + Math.round(A*100) / 100 + 'x^' + Math.round(B*100) / 100;

        return {equation: [A, B], points: results, string: string};
    }
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function _polynomial(data, order) {
    	if(typeof order == 'undefined'){
    		order = 2;
    	}
    	var lhs = [], rhs = [], results = [], a = 0, b = 0, i = 0, k = order + 1;

    	for (; i < k; i++) {
    		for (var l = 0, len = data.length; l < len; l++) {
    			if (data[l][1]) {
    				a += Math.pow(data[l][0], i) * data[l][1];
    			}
    		}
    		lhs.push(a), a = 0;
    		var c = [];
    		for (var j = 0; j < k; j++) {
    			for (var l = 0, len = data.length; l < len; l++) {
    				if (data[l][1]) {
    					b += Math.pow(data[l][0], i + j);
    				}
    			}
    			c.push(b), b = 0;
    		}
    		rhs.push(c);
    	}
    	rhs.push(lhs);

    	var equation = gaussianElimination(rhs, k);

    	for (var i = 0, len = data.length; i < len; i++) {
    		var answer = 0;
    		for (var w = 0; w < equation.length; w++) {
    			answer += equation[w] * Math.pow(data[i][0], w);
    		}
    		results.push([data[i][0], answer]);
    	}

    	var string = 'y = ';

    	for(var i = equation.length-1; i >= 0; i--){
    		if(i > 1) string += Math.round(equation[i]*100) / 100 + 'x^' + i + ' + ';
    		else if (i == 1) string += Math.round(equation[i]*100) / 100 + 'x' + ' + ';
    		else string += Math.round(equation[i]*100) / 100;
    	}

    	return {equation: equation, points: results, string: string};
    }
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function  gaussianElimination(a, o) {
        var i = 0, j = 0, k = 0, maxrow = 0, tmp = 0, n = a.length - 1, x = new Array(o);
        for (i = 0; i < n; i++) {
           maxrow = i;
           for (j = i + 1; j < n; j++) {
              if (Math.abs(a[i][j]) > Math.abs(a[i][maxrow]))
                 maxrow = j;
           }
           for (k = i; k < n + 1; k++) {
              tmp = a[k][i];
              a[k][i] = a[k][maxrow];
              a[k][maxrow] = tmp;
           }
           for (j = i + 1; j < n; j++) {
              for (k = n; k >= i; k--) {
                 a[k][j] -= a[k][i] * a[i][j] / a[i][i];
              }
           }
        }
        for (j = n - 1; j >= 0; j--) {
           tmp = 0;
           for (k = j + 1; k < n; k++)
              tmp += a[k][j] * x[k];
           x[j] = (a[n][j] - tmp) / a[j][j];
        }
        return (x);
	 }

   
}(Highcharts));