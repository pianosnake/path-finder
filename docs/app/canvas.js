//convenience methods on canvas context

if(typeof CanvasRenderingContext2D.prototype.drawCircle !== "function"){
  CanvasRenderingContext2D.prototype.drawCircle = function(x, y, color){
    var radius = 5;
    this.fillStyle = color;
    this.lineWidth = 1;
    this.strokeStyle = '#003300';
    this.beginPath();
    this.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.fill();
    this.stroke();
  }
}

if(typeof CanvasRenderingContext2D.prototype.drawPath !== "function"){
  CanvasRenderingContext2D.prototype.drawPath = function(path){
    this.strokeStyle = "red";
    this.beginPath();
    this.moveTo(path[0][0], path[0][1]);
    for(i = 1; i < path.length; i++){
      this.lineTo(path[i][0], path[i][1]);
    }
    this.stroke();
  }
}

if(typeof CanvasRenderingContext2D.prototype.drawImageAndAdjustCanvas !== "function"){
  CanvasRenderingContext2D.prototype.drawImageAndAdjustCanvas = function(img){
      this.canvas.setAttribute("width", img.width);
      this.canvas.setAttribute("height", img.height);
      this.drawImage(img, 0, 0);
  }
}