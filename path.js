document.addEventListener("DOMContentLoaded", init, false);
var context,canvas,startPt,endPt,imageData; 
var width=453,height=373;
//var width=136,height=192;
//var width=68,height=96;


function init(){
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext('2d');
    
    var img = new Image();
    img.onload = function(){
        context.drawImage(img,0,0,width,height);
        imageData = context.getImageData(0,0,width,height).data;
     }
    //set the source of the image after you define the onload event 
    img.src = 'deer_ridge.png';
     
    //non IE 
    canvas.addEventListener("mousedown", setEndPoints, false);
    canvas.addEventListener("mousemove", showCoordinates, false);
}


function getPosition(event){
    //from http://miloq.blogspot.com/2011/05/coordinates-mouse-click-canvas.html
    var x,y,v;
    if (event.x != undefined && event.y != undefined){
        x = event.x;
        y = event.y;
    }else{
    // Firefox method to get the position
      x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    if(x>width || y>height){
        //do nothing if the click is outside the canvas
        return; 
    }
    v = imageData[4*(x+width*y)];
    return {x:x,y:y,v:v};
}

function showCoordinates(event){
    //function called when user moves mouse over canvas
    var pt= getPosition(event);
    setHtml("posDiv","x "+pt.x + " y "+ pt.y + " v "+pt.v); 
}
  
function setEndPoints(event){
    //function called when user clicks on canvas
    var pt= getPosition(event);   
    var p = pt.x+"-"+pt.y;
    if(!startPt){
        //define the start point.   g is the score to get to itself, its 0 in the beginning, f is a high score as a default start  
        startPt ={x:pt.x,
			y:pt.y,
			v:pt.v,
			p:p,
			g:0,
			f:0,
			par:null,
			o:1,
			i:null
		};
       setHtml("startDiv","x "+pt.x + " y "+ pt.y + " v "+pt.v); 
    }else{
       setHtml("endDiv","x "+pt.x + " y "+ pt.y + " v "+pt.v);   
        endPt ={x:pt.x,y:pt.y,v:pt.v,p:p}
    }
}

function setHtml(div,html){
    document.getElementById(div).innerHTML = html; 
}

function checkInputs(){
  if(!startPt){
        alert("Click elevation model to set start point"); 
        return; 
    }
    if(!endPt){
        alert("Click elevation model to set end point"); 
        return; 
    }
    setHtml("pathDiv"," ... computing ... ");
    var t= setTimeout(runAlgo,100); 
}


//the open list, and the low point.  e contains everything, but mostly needed for looking up if items are on the open or closed list, as that is too time consuming to do with large arrays.  
var o=[],low,e={}; 

function runAlgo(){
    //add start point to the open list.  regular push is ok since there's just one item 
    o.push(startPt);
    e[startPt.p]=startPt;
    console.log("running algo"); 
    //iterate through open list until the end point is in the closed list 
     while(!ptOpenOrClosed(endPt,0)){
   //for(var i=0; i<70; i++){
        iterateOpen();
    }
    console.log("done.");
    drawPath(); 
    //reset the start and end points 
    startPt = null;
    endPt = null; 
    //remove event for mousedown
    canvas.removeEventListener("mousedown", setEndPoints,false);
}

function ptOpenOrClosed(a,b){
    //return true is point is in 'e' and if the first item in its array is a 0 (for closed) 
    if(e[a.p]){
        if(e[a.p].o==b){
            return true;
        }else{
            return false; 
        }
    }else{
        return false; 
    }
}

function iterateOpen(){
    //pick the point with the lowest f-score (ie the first one, since we're using a binary heap to keep the open list quasi-sorted) and move point to the closed list
    
    low = o.shiftHeap();
    //add it to closed list, by changing 'o' property to 0 
    e[low.p].o=0;
 
    //get the neighbors 
    var ns = getNeighbors(low);
     var i = ns.length; 
    while (i--){
        var n= ns[i];
        //calculate the g score for the neighbor 
        var g = n.g+low.g+n.d;
        
        if(ptOpenOrClosed(n,0)){
        	//if it's in the closed list, ignore it
            continue; 
        }
        
        if(ptOpenOrClosed(n,1)){
            //if neighbor is in open list already check score to see if this approach is better
            var en = e[n.p];
            if(en.g>g){
                //update the score to approaching it from this pt 
               en.g= g;
               en.f= g+n.h;
               //update the parent to this
               en.par= low.p;
               //we changed the f-score, so reorder the heap 
               o.updateHeap(en.i);
            }
        }else{
            //if not in open list then add it to the open list 
            //make the parent the current point 
            n.par = low.p;
            n.g= g;
            n.o= 1;
            n.f= g+n.h;
            n.i= null;
            e[n.p]=n;
            o.pushHeap(n); 
        }
    }
}

//the neighbor addresses 
var nba =[
//n
[0,-1,2],
//s
[0,1,2],
//e
[1,0,2],
//w
[-1,0,2],
//nw
[-1,-1,3],
//ne
[1,-1,3],
//sw
[-1,1,3],
//se
[1,1,3]
]; 

function getNeighbors(p){
//returns an array of all the neighbors.  each point is an object with properties
// p: 'x-y'  the written form of the point
// x: x value
// y: y value 
// d: the absolute difference in pixel values of moving from p to n
// g: if the point is to the right, left, up or down then a 2.  if diagonal then a 3 
// h: the heuristic, the manhattan distance to get from this point to the endPt

    var ns = [];
    var a =8; 
    while (a--){
		var nx = p.x+nba[a][0], 
			ny = p.y+nba[a][1]; 
		//stay within the bounds of the image
        if(nx>=0 && nx<width && ny>=0 && ny<height){
			var nv= imageData[4*(nx+width*ny)];
			//this is supposedly faster than pushing http://dev.opera.com/articles/view/efficient-javascript/?page=all
			ns[ns.length]={
				p:nx+'-'+ny,
				x:nx,
				y:ny,
				v:nv,
				d:Math.abs(p.v-nv)*5,
				g:nba[a][2],
				h:Math.abs(endPt.x-nx)+Math.abs(endPt.y-ny)
			}; 
       } 
    }
    return ns; 
}


function drawPath(){
	var par =e[endPt.p].par,
		ct =0;
    context.strokeStyle = "red"; 
    context.beginPath();
    context.moveTo(endPt.x, endPt.y);
    while(e[par]){
        ct++; 
        context.lineTo(e[par].x, e[par].y);
        par =e[par].par; 
	}
    context.stroke();
    setHtml("pathDiv","points "+ct );
}