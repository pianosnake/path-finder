//algorithm implemented from description at http://www.policyalmanac.org/games/aStarTutorial.htm

angular.module('astar', []).
  factory('astarService', function(){

    //the neighbor addresses
    var nba =[
        //n,  s,  e,  w (cost 2 points)
        [0,-1,2],[0,1,2],[1,0,2],[-1,0,2],
        //nw,  ne,  sw,  se (cost 3 points)
        [-1,-1,3],[1,-1,3],[-1,1,3],[1,1,3]
      ],

    //the open list.
    o=[],
    //the low point
    low=null,
    //e is a hash lookup of all the points in the open or closed list
    e={},
    imageData, width, height, endPt;

    function solve(startPt, _endPt_, _imageData_, _width_, _height_){
      low = null;
      o=[];
      e={};
      imageData = _imageData_;
      width = _width_;
      height = _height_;
      endPt = _endPt_;
      //add start point to the open list.  regular push is ok since there's just one item
      o.push(startPt);
      e[startPt.p]=startPt;
      //iterate through open list until the end point is in the closed list
      while(!inClosed(endPt)){
        iterateOpen();
      }
      return tracePath();
    }

    function inOpen(a){
      if(e[a.p]){
        return e[a.p].o===1;
      }else{
        return false;
      }
    }

    function inClosed(a){
      if(e[a.p]){
        return e[a.p].o===0;
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

        if(inClosed(n)){
          //if it's in the closed list, ignore it
          continue;
        }

        if(inOpen(n)){
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


    function tracePath(){
      //trace path by following parents from end to start
      var par =e[endPt.p].par,
        ct =0,path=[[e[endPt.p].x,e[endPt.p].y]];

      while(e[par]){
        ct++;
        path[ct]=[e[par].x,e[par].y];
        par =e[par].par;
      }
      return path;
    }

    return {
      solve: solve
    };


  });
