angular.module('pathFinder', ['astar', 'canvas'])

.filter('pointDisplay', function(){
  return function(pt){
    if(pt){
      return "x: " + pt.x + " y: " + pt.y + " v: " + pt.v;
    }else{
      return "";
    }
  }
})

.directive('pathFinderCanvas', ['astarService', 'canvasService', function(astar, canvas){
  var imageData, canvas, width, height, context, contextImageData;

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
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    v = imageData[4 * (x + width * y)];
    return {x:x, y:y, v:v};
  };

  var drawCircle = function(x, y, color){
    var radius = 5;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = '#003300';
    context.stroke();
  };

  var drawPath = function(path){
    context.strokeStyle = "red";
    context.beginPath();
    context.moveTo(path[0][0], path[0][1]);
    for(i=1; i<path.length; i++){
      context.lineTo(path[i][0], path[i][1]);
    }
    context.stroke();
  }

  var resetCanvas = function(){
    context.putImageData(contextImageData, 0, 0);
  }

  return {
    restrict:'E',
    templateUrl:'app/path-finder-canvas.html',

    link:function(scope, elem, attrs){
      canvas = elem.find('canvas')[0];
      context = canvas.getContext('2d');
      var img = new Image();

      //define an image load event first
      img.onload = function(){
        width = img.width;
        height = img.height;
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        context.drawImage(img, 0, 0);

        //save the image data for quick lookup
        contextImageData = context.getImageData(0, 0, width, height)
        imageData = contextImageData.data;
      }
      //load the image from src param
      img.src = attrs.src;


      elem.bind('mousemove', function(event){
        scope.mouseMovePosition = getPosition(event);
        scope.$digest();
      });


      elem.bind('mousedown', function(event){
        var pt = getPosition(event);
        var p = pt.x + "-" + pt.y;

        if(scope.startPt && scope.endPt){
          resetCanvas();
          scope.startPt = null;
          scope.endPt = null;
        }

        if(!scope.startPt){
          //define the start point.   g is the score to get to itself, its 0 in the beginning, f is a high score as a default start
          scope.startPt = {x:pt.x, y:pt.y, v:pt.v, p:p, g:0, f:0, par:null, o:1, i:null};
          drawCircle(pt.x, pt.y, 'lightgreen');
        }else if(!scope.endPt){
          scope.endPt = {x:pt.x, y:pt.y, v:pt.v, p:p};
          drawCircle(pt.x, pt.y, 'red');

          setTimeout(function(){
            var path = astar.solve(scope.startPt, scope.endPt, imageData, width, height);
            drawPath(path);
          },10);
        }
        scope.$digest();

      });
    }

  };
}])

.controller('canvasCtrl', function($scope){

})


