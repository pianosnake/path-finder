angular.module('pathFinder', ['astar'])

.filter('pointDisplay', function(){
  return function(pt){
    if(pt){
      return "x: " + pt.x + " y: " + pt.y + " v: " + pt.v;
    }else{
      return "";
    }
  }
})

.directive('pathFinderCanvas', ['astarService', function(astar){
  var canvas, context, contextImageData;

  var getPosition = function(event){
    var x, y, v;
    if(event.x && event.y){
      x = event.x;
      y = event.y;
    }else{
      // Firefox
      x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= event.target.offsetLeft;
    y -= event.target.offsetTop;
    v = contextImageData.data[4 * (x + contextImageData.width * y)];
    return {x:x, y:y, v:v};
  };

  var loadImage = function(src){
    var img = new Image();
    img.onload = function(){
      context.drawImageAndAdjustCanvas(img);
      //save the image data for quick lookup
      contextImageData = context.getImageData(0, 0, img.width, img.height);
    }
    //load the image from src param
    img.src = src;
  }

  var resetCanvas = function(){
    context.putImageData(contextImageData, 0, 0);
  }

  return {
    restrict:'E',
    scope: {},
    templateUrl:'app/path-finder-canvas.html',

    link:function(scope, elem, attrs){
      canvas = elem.find('canvas')[0];
      context = canvas.getContext('2d');

      loadImage(attrs.src);

      elem.bind('mousemove', function(event){
        scope.mousePosition = getPosition(event);
        scope.$digest();
      });


      elem.bind('mousedown', function(event){
        var pt = getPosition(event);
        var ptLookupKey = pt.x + "-" + pt.y;

        if(scope.startPt && scope.endPt){
          resetCanvas();
          scope.startPt = null;
          scope.endPt = null;
        }

        if(!scope.startPt){
          //define the start point.   g is the score to get to itself, its 0 in the beginning, f is a high score as a default start
          scope.startPt = {x:pt.x, y:pt.y, v:pt.v, p:ptLookupKey, g:0, f:0, par:null, o:1, i:null};
          context.drawCircle(pt.x, pt.y, 'lightgreen');

        }else if(!scope.endPt){
          scope.endPt = {x:pt.x, y:pt.y, v:pt.v, p:ptLookupKey};
          context.drawCircle(pt.x, pt.y, 'red');

          setTimeout(function(){
            var path = astar.solve(scope.startPt, scope.endPt, contextImageData);
            context.drawPath(path);
          },10);
        }
        scope.$digest();

      });
    }

  };
}]);



