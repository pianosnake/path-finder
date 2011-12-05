//written by Florin Alexandrescu geotangents@gmail.com, Nov 2011, unless otherwise noted
//modify the Array object to have support operations on binary heaps
//description of algorithm from http://www.policyalmanac.org/games/binaryHeaps.htm
if(typeof Array.prototype.pushHeap !== "function"){
    Array.prototype.pushHeap =  function(v){
        //add item to the end. this is supposedly faster than pushing http://dev.opera.com/articles/view/efficient-javascript/?page=all
        this[this.length]=v; 
        //update the index of v to show it's at the end of the array 
        this[this.length-1].i=this.length-1; 
        var h= Math.floor(this.length/2),
            p = this[h-1],
            vpos = this.length-1; 
        
        //repeat while v's f-score is lower than the parent's
        while(p && v.f<p.f ){
            //swap the parent with v
            this[h-1] = v;
            v.i=h-1;
            this[vpos] = p; 
            p.i=vpos; 
            vpos=h-1; 
            h=Math.floor(h/2);
            p=this[h-1];
        }
        return this.length; 
    }
}

if(typeof Array.prototype.updateHeap !== "function"){
    Array.prototype.updateHeap =  function(idx){
        //when the score of an item changes, it needs to be compared to its parent again to see if it needs to move
        //the parent in a 1-based index is floor(x/2).  but in a 0-based index it's ceil(x/2)-1
        var h= Math.ceil(idx/2)-1,
            p = this[h],
            v = this[idx],
            vpos =idx; 
        //repeat while v's f-score is lower than the parent's
        while(p && v.f<p.f ){
            //swap the parent with v
            this[h] = v;
            v.i=h; 
            this[vpos] = p;
            p.i=vpos; 
            vpos =h; 
            h=Math.ceil(h/2)-1;
            p=this[h];
        } 
    }
}


if(typeof Array.prototype.shiftHeap !== "function"){
    Array.prototype.shiftHeap =  function(){
        if(this.length<3){
            //update the indexes for the few items
             if(this[1]){this[1].i=0};
            
            //regular shift if there are 0,1 or 2 items in array
           return this.shift(); 
        }
        //remove the first element,  pos=position of the element as it moves through the array, p2 is twice it.
        var r = this.shift(),pos=0,p2,kid1,kid2,v;
        //put the last element first 
        this.unshift(this.pop()); 
        //update the index of the first element 
        this[0].i = 0; 
        //the first two kids are at index 1 and 2 
        kid1 = this[1];
        kid2 = this[2];
        v= this[pos]; 
        
        //repeat while parent's f-score is greater than either of its two children 
        while((kid1 && v.f>kid1.f) || (kid2 && v.f>kid2.f)){
            //swap it with the lowest of the two
            if(!kid2 || kid1.f<=kid2.f){
                //if kid 2 is undefined, swap parent with kid1 
                this[pos] = kid1;
                kid1.i=pos;             
                pos = pos*2 +1;
            }else{
                this[pos] = kid2;
                kid2.i=pos;             
                pos = pos*2 +2;
            }
            this[pos]=v; 
            v.i=pos; 
            p2 = pos*2;
            kid1 = this[p2+1];
            kid2 = this[p2+2];
        }
        return r; 
    }
}


var PATH = function(){
    var canvas,context,startPt,endPt,image,imageData,width,height,posDiv,endDiv,startDiv,pathDiv,draw,callback,
    //the neighbor addresses 
    nba =[
    //n,  s,  e,  w
    [0,-1,2],[0,1,2],[1,0,2],[-1,0,2],
    //nw,  ne,  sw,  se
    [-1,-1,3],[1,-1,3],[-1,1,3],[1,1,3]
    ],
    //the open list, and the low point.  e contains all the points in the open or closed list. needed for looking up if items are on the open or closed list, as that is too time consuming to do with large arrays.  
    o=[],low,e={}; 

    function init(config){
    //  summary: 
    //      Set up the canvas, context, and load the image
    //  config: (Object)
    //      The confi object contains 'canvas' which is the id of the canvas object, 
    //      and image, which is the URL to the image to use 
    
        canvas = document.getElementById(config.canvas);
        context = canvas.getContext('2d');
        width = canvas.width;
        height = canvas.height;
        draw = config.draw;
        callback = config.callback;
        posDiv = config.posDiv ? document.getElementById(config.posDiv):null;
        endDiv = config.endDiv ? document.getElementById(config.endDiv):null;
        startDiv = config.startDiv ? document.getElementById(config.startDiv):null;
        pathDiv = config.pathDiv ? document.getElementById(config.pathDiv):null;
        
        var img = new Image();
        img.onload = function(){
            context.drawImage(img,0,0,width,height);
            image = context.getImageData(0,0,width,height);
            imageData = image.data; 
         }
        //set the source of the image after you define the onload event 
        img.src = config.imgSrc;
         
        //canvas clicks and mouseovers
        canvas.addEventListener("mousedown", setEndPoints, false);
        if(posDiv){
            canvas.addEventListener("mousemove", showCoordinates, false);
        }
    }
    
    function getPosition(event){
        //from http://miloq.blogspot.com/2011/05/coordinates-mouse-click-canvas.html
        var x,y,v;
        if (event.x !== undefined && event.y !== undefined){
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
        //function called when user moves mouse over canvas, and if a posDiv is provided 
        var pt= getPosition(event);
        setHtml(posDiv,"x "+pt.x + " y "+ pt.y + " v "+pt.v); 
    }
    
    function setHtml(div,html){
        if(div){
            div.innerHTML = html; 
        }
    }

    function setEndPoints(event){
        //function called when user clicks on canvas
        var pt= getPosition(event),   
            p = pt.x+"-"+pt.y;
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
           setHtml(startDiv,"x "+pt.x + " y "+ pt.y + " v "+pt.v); 
           setHtml(endDiv," ");   
        }else{
           setHtml(endDiv,"x "+pt.x + " y "+ pt.y + " v "+pt.v);   
            endPt ={x:pt.x,y:pt.y,v:pt.v,p:p};
        }
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
        setHtml(pathDiv," ... computing ... ");
        setTimeout(runAlgo,100); 
    }

    function runAlgo(){
        //add start point to the open list.  regular push is ok since there's just one item 
        o.push(startPt);
        e[startPt.p]=startPt;
        //iterate through open list until the end point is in the closed list 
         while(!ptOpenOrClosed(endPt,0)){
            iterateOpen();
        }       
        callback(returnPath());
        //reset the start and end points 
        startPt = null;
        endPt = null; 
        low = null;
        o=[];
        e={};
         
    }

    function ptOpenOrClosed(a,b){
        //a is the point, b is 0 or 1, indicating if value of 'o' (ie. open or closed) 
        if(e[a.p]){
            if(e[a.p].o===b){
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
        var ns = getNeighbors(low),n,g,i=ns.length,en;
            
        while (i--){
            n= ns[i];
            //calculate the g score for the neighbor 
            g = n.g+low.g+n.d;
            
            if(ptOpenOrClosed(n,0)){
                //if it's in the closed list, ignore it
                continue; 
            }
            
            if(ptOpenOrClosed(n,1)){
                //if neighbor is in open list already check score to see if this approach is better
                en = e[n.p];
                if(en.g>g){
                    //update the score to approaching it from this pt 
                   en.g= g;
                   en.f= g+n.h;
                   //update the parent to low
                   en.par= low.p;
                   //we changed the f-score, so reorder the heap giving the index to start from
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

    function getNeighbors(p){
    //returns an array of all the neighbors.  each point is an object with properties
    // p: 'x-y'  the written form of the point
    // x: x value
    // y: y value 
    // d: the absolute difference in pixel values of moving from p to n
    // g: if the point is to the right, left, up or down then a 2.  if diagonal then a 3 
    // h: the heuristic, the manhattan distance to get from this point to the endPt

        var ns = [],a=8,nx,ny,nv;
        while (a--){
            nx = p.x+nba[a][0];
            ny = p.y+nba[a][1]; 
            //stay within the bounds of the image
            if(nx>=0 && nx<width && ny>=0 && ny<height){
                nv= imageData[4*(nx+width*ny)];
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


    function returnPath(){
          var par =e[endPt.p].par,
            ct =0,path=[[e[endPt.p].x,e[endPt.p].y]];
            if(draw){
                context.strokeStyle = "red"; 
                context.beginPath();
                context.moveTo(endPt.x, endPt.y);
                }
        while(e[par]){
            ct++; 
            path[ct]=[e[par].x,e[par].y];
            if(draw){
                context.lineTo(e[par].x, e[par].y);
            }
            par =e[par].par; 
            
        }
        if(draw){
             context.stroke();
        }
        setHtml(pathDiv,"points "+ct + " (Click image to start over)" );
        return path;
    }
    
    function resetCanvas(){
        context.putImageData(image,0,0);
        setHtml(pathDiv," " );
        setHtml(startDiv," "); 
        setHtml(endDiv," ");  
    }
    
    //the public methods 'revealing module pattern'  stefanov p. 99 
    return {
        init:init,
        resetCanvas:resetCanvas,
        start:checkInputs
    }
    
}();


