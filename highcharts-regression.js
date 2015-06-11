/* Code extracted from https://github.com/Tom-Alexander/regression-js/
 
 Modifications of January 5, 2015

	- Add dashStyle ('' by default)
	
*/

(function (H) {
    

    H.wrap(H.Chart.prototype, 'init', function (proceed) {
        var series = arguments[1].series ;
        var extraSeries = [];
        var i = 0 ;
        for (i = 0 ; i < series.length ; i++){
            var s = series[i];
            if ( s.regression && !s.rendered ) {
                s.regressionSettings =  s.regressionSettings || {} ;
                s.regressionSettings.tooltip = s.regressionSettings.tooltip || {} ;
                s.regressionSettings.dashStyle = s.regressionSettings.dashStyle || 'solid';

                var regressionType = s.regressionSettings.type || "linear" ;
                var regression; 
                var extraSerie = {
                        data:[],
                        color: s.color ,
                        yAxis: s.yAxis ,
                        lineWidth: 2,
                        marker: {enabled: false} ,
                        isRegressionLine: true,
                        type: s.regressionSettings.linetype || 'spline',
                        name: s.regressionSettings.name || "Equation: %eq", 
                        color: s.regressionSettings.color || '',
                        dashStyle: s.regressionSettings.dashStyle || 'solid',
                        tooltip:{ 
	                        	valueSuffix : s.regressionSettings.tooltip.valueSuffix || ' '
                    	}
                };
                
                
                if (regressionType == "linear") {
                    regression = _linear(s.data) ;
                    extraSerie.type = "line";
                }else if (regressionType == "exponential") {
                    regression = _exponential(s.data) 
                }                                
                else if (regressionType == "polynomial"){  
	                var order = s.regressionSettings.order || 2
                    regression = _polynomial(s.data, order) ;                    
                }else if (regressionType == "logarithmic"){
                    regression = _logarithmic(s.data) ;
                }else if (regressionType == "loess"){
                    var loessSmooth = s.regressionSettings.loessSmooth || 25
                    regression = _loess(s.data, loessSmooth/100) ;
                }else {
                    console.error("Invalid regression type: " , regressionType) ;
                    break;
                }

                
                regression.rSquared =  coefficientOfDetermination(s.data, regression.points).toFixed(2);
                regression.rValue = Math.sqrt(regression.rSquared,2).toFixed(2) ;
                extraSerie.data = regression.points ;
                extraSerie.name = extraSerie.name.replace("%r2",regression.rSquared);
                extraSerie.name = extraSerie.name.replace("%r",regression.rValue);
                extraSerie.name = extraSerie.name.replace("%eq",regression.string);               
                
                extraSerie.regressionOutputs = regression ;
                extraSeries.push(extraSerie) ;
                arguments[1].series[i].rendered = true;                           
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
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
          if (data[n][1]) {
            sum[0] += data[n][0]; // X
            sum[1] += data[n][1]; // Y
            sum[2] += data[n][0] * data[n][0] * data[n][1]; // XXY
            sum[3] += data[n][1] * Math.log(data[n][1]); // Y Log Y 
            sum[4] += data[n][0] * data[n][1] * Math.log(data[n][1]); //YY Log Y
            sum[5] += data[n][0] * data[n][1]; //XY
          }
        }

        var denominator = (sum[1] * sum[2] - sum[5] * sum[5]);
        var A = Math.pow(Math.E, (sum[2] * sum[3] - sum[5] * sum[4]) / denominator);
        var B = (sum[1] * sum[4] - sum[5] * sum[3]) / denominator;

        for (var i = 0, len = data.length; i < len; i++) {
            var coordinate = [data[i][0], A * Math.pow(Math.E, B * data[i][0])];
            results.push(coordinate);
        }

        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = ' + Math.round(A*100) / 100 + 'e^(' + Math.round(B*100) / 100 + 'x)';

        return {equation: [A, B], points: results, string: string};
    } 
    
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     * Human readable formulas: 
     * 
     *              N * Σ(XY) - Σ(X) 
     * intercept = ---------------------
     *              N * Σ(X^2) - Σ(X)^2
     * 
     * correlation = N * Σ(XY) - Σ(X) * Σ (Y) / √ (  N * Σ(X^2) - Σ(X) ) * ( N * Σ(Y^2) - Σ(Y)^2 ) ) )
     * 
     */
    function _linear(data) {
        var sum = [0, 0, 0, 0, 0], n = 0, results = [], N = data.length;

        for (; n < data.length; n++) {
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
          if (data[n][1]) {
            sum[0] += data[n][0]; //Σ(X) 
            sum[1] += data[n][1]; //Σ(Y)
            sum[2] += data[n][0] * data[n][0]; //Σ(X^2)
            sum[3] += data[n][0] * data[n][1]; //Σ(XY)
            sum[4] += data[n][1] * data[n][1]; //Σ(Y^2)
          } else {
            N -= 1;
          }
        }

        var gradient = (N * sum[3] - sum[0] * sum[1]) / (N * sum[2] - sum[0] * sum[0]);
        var intercept = (sum[1] / N) - (gradient * sum[0]) / N;
        // var correlation = (N * sum[3] - sum[0] * sum[1]) / Math.sqrt((N * sum[2] - sum[0] * sum[0]) * (N * sum[4] - sum[1] * sum[1]));
        
        for (var i = 0, len = data.length; i < len; i++) {
            var coordinate = [data[i][0], data[i][0] * gradient + intercept];
            results.push(coordinate);
        }

        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = ' + Math.round(gradient*100) / 100 + 'x + ' + Math.round(intercept*100) / 100;
        return {equation: [gradient, intercept], points: results, string: string};
    }
    
    /**
     *  Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function _logarithmic(data) {
        var sum = [0, 0, 0, 0], n = 0, results = [],mean = 0 ;
        

        for (len = data.length; n < len; n++) {
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
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

        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = ' + Math.round(A*100) / 100 + ' + ' + Math.round(B*100) / 100 + ' ln(x)';
        
        return {equation: [A, B], points: results, string: string};
    }
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function _power(data) {
        var sum = [0, 0, 0, 0], n = 0, results = [];

        for (len = data.length; n < len; n++) {
          if (data[n]['x']) {
            data[n][0] = data[n]['x'];
            data[n][1] = data[n]['y'];
          }
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

        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = ' + Math.round(A*100) / 100 + 'x^' + Math.round(B*100) / 100;

        return {equation: [A, B], points: results, string: string};
    }
    
    /**
     * Code extracted from https://github.com/Tom-Alexander/regression-js/
     */
    function _polynomial(data, order) {
        if(typeof order == 'undefined'){
            order =2;
        }
        var lhs = [], rhs = [], results = [], a = 0, b = 0, i = 0, k = order + 1;

        for (; i < k; i++) {
            for (var l = 0, len = data.length; l < len; l++) {
                if (data[l]['x']) {
                    data[l][0] = data[l]['x'];
                    data[l][1] = data[l]['y'];
                }
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

        results.sort(function(a,b){
           if(a[0] > b[0]){ return 1}
            if(a[0] < b[0]){ return -1}
              return 0;
        });

        var string = 'y = ';

        for(var i = equation.length-1; i >= 0; i--){
            if(i > 1) string += Math.round(equation[i]*100) / 100 + 'x^' + i + ' + ';
            else if (i == 1) string += Math.round(equation[i]*100) / 100 + 'x' + ' + ';
            else string += Math.round(equation[i]*100) / 100;
        }

        return {equation: equation, points: results, string: string};
    }
    
    /**
     * @author: Ignacio Vazquez
     * Based on 
     * - http://commons.apache.org/proper/commons-math/download_math.cgi LoesInterpolator.java
     * - https://gist.github.com/avibryant/1151823
     */
    function _loess (data, bandwidth) {
        var bandwidth = bandwidth || 0.25 ;
        
        var xval = data.map(function(pair){return pair[0]});
        var distinctX =  array_unique(xval) ;
        if (  2 / distinctX.length  > bandwidth ) {
            bandwidth = Math.min( 2 / distinctX.length, 1 );
            console.warn("updated bandwith to "+ bandwidth);
        }
        
        var yval = data.map(function(pair){return pair[1]});
        
        function array_unique(values) {
            var o = {}, i, l = values.length, r = [];
            for(i=0; i<l;i+=1) o[values[i]] = values[i];
            for(i in o) r.push(o[i]);
            return r;
        }
        
        function tricube(x) {
            var tmp = 1 - x * x * x;
            return tmp * tmp * tmp;
        }

        var res = [];

        var left = 0;
        var right = Math.floor(bandwidth * xval.length) - 1;

        for(var i in xval)
        {
            var x = xval[i];
    
            if (i > 0) {
                if (right < xval.length - 1 &&
                        xval[right+1] - xval[i] < xval[i] - xval[left]) {
                    left++;
                    right++;
                }
            }
            //console.debug("left: "+left  + " right: " + right );
            var edge;
            if (xval[i] - xval[left] > xval[right] - xval[i])
                edge = left;
            else
                edge = right;
            var denom = Math.abs(1.0 / (xval[edge] - x));
            var sumWeights = 0;
            var sumX = 0, sumXSquared = 0, sumY = 0, sumXY = 0;

            var k = left;
            while(k <= right)
            {
                var xk = xval[k];
                var yk = yval[k];
                var dist;
                if (k < i) {
                    dist = (x - xk);
                } else {
                    dist = (xk - x);
                }
                var w = tricube(dist * denom);
                var xkw = xk * w;
                sumWeights += w;
                sumX += xkw;
                sumXSquared += xk * xkw;
                sumY += yk * w;
                sumXY += yk * xkw;
                k++;
            }

            var meanX = sumX / sumWeights;
            //console.debug(meanX);
            var meanY = sumY / sumWeights;
            var meanXY = sumXY / sumWeights;
            var meanXSquared = sumXSquared / sumWeights;

            var beta;
            if (meanXSquared == meanX * meanX)
                beta = 0;
            else
                beta = (meanXY - meanX * meanY) / (meanXSquared - meanX * meanX);

            var alpha = meanY - beta * meanX;
            res[i] = beta * x + alpha;
        }
        console.debug(res);
        return { 
            equation: "" , 
            points: xval.map(function(x,i){return [x, res[i]]}), 
            string:""
        } ;
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
    
    /**
     * @author Ignacio Vazquez 
     * See http://en.wikipedia.org/wiki/Coefficient_of_determination for theaorical details 
     */
    function coefficientOfDetermination (data, pred ) {
        
        var i = SSE = SSYY =  mean = 0, N = data.length;

        // Calc the mean
        for (i = 0 ; i < data.length ; i++ ){
            if (data[i][1]) {
                mean += data[i][1];
            } else {
                N--;
            }
        }
        mean /= N;
        
        // Calc the coefficent of determination 
        for (i = 0 ; i < data.length ; i++ ){
            if (data[i][1]) {
                SSYY +=  Math.pow( data[i][1] -  pred[i][1] , 2) ;
                SSE +=  Math.pow( data[i][1] -  mean , 2) ;
            }
        }
        return  1 - ( SSYY / SSE)  ;
    }


   
}(Highcharts));
