(function(){

var app = angular.module('path-finder', []);

app.filter('pointDisplay', function(){
  return function(pt){
    if(pt){
      return "x: "+pt.x + " y: "+pt.y+ " v: "+pt.v;
    }else{
      return "";
    }
  }
});

 app.directive('pathFinderCanvas', function() {
  var imageData, el, width, height; 

  var getPosition = function(event){
    var x,y,v;
    if (event.x && event.y){
        x = event.x;
        y = event.y;
    }else{
    // Firefox method to get the position
      x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= el.offsetLeft;
    y -= el.offsetTop;
    if(x>width || y>height){
        //do nothing if the mouse is outside the canvas
        return; 
    }
    v = imageData[4*(x+width*y)];
    return {x:x,y:y,v:v};
  };

  return {
    restrict: 'E',
    replace: true,
    template: '<canvas width="{{width}}" height="{{height}}"></canvas>',
    controller: 'canvasCtrl',

    link: function(scope, elem, attrs) {
      var context = elem[0].getContext('2d');
      var img = new Image();
      //define an image load event first
      img.onload = function(){
          context.drawImage(img,0,0);
          width = attrs.width;
          height = attrs.height;
          el = elem[0];
          var contextImageData = context.getImageData(0,0,width,height);
          imageData = contextImageData.data;
        }
      //then load the image from src param
      img.src = attrs.src;

      elem.bind('mousemove', function(event) {
        scope.mouseMovePosition = getPosition(event);
        scope.$digest();
      });


      elem.bind('mousedown', function(event){
          var pt= getPosition(event);
          var p = pt.x+"-"+pt.y;
          
          if(!scope.startPt){
              //define the start point.   g is the score to get to itself, its 0 in the beginning, f is a high score as a default start  
              scope.startPt ={x:pt.x, y:pt.y, v:pt.v,p:p,g:0,f:0,par:null,o:1,i:null};
          }else{
              scope.endPt ={x:pt.x,y:pt.y,v:pt.v,p:p};
          }
          scope.$digest();

      });
    }

  };
});

 app.controller('canvasCtrl', function($scope){
    
 })




})();



