//modify the Array object to have support operations on binary heaps
//description of algorithm from http://www.policyalmanac.org/games/binaryHeaps.htm
Array.prototype.pushHeap =  function(v){
    //add item to the end
    var l = this.push(v); 
    //update the index of v to show it's at the end of the array 
    this[l-1].i=l-1; 
    var h= Math.floor(l/2);
    var p = this[h-1];
    var vpos = l-1; 
    
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
    return l; 
}

Array.prototype.updateHeap =  function(idx){
    //when the score of an item changes, it needs to be compared to its parent again to see if it needs to move
    //the parent in a 1-based index is floor(x/2).  but in a 0-based index it's ceil(x/2)-1
    var h= Math.ceil(idx/2)-1;
    var p = this[h];
    var v = this[idx];
    var vpos =idx; 
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

Array.prototype.shiftHeap =  function(v){
    if(this.length<3){
        //update the indexes for the few items
         if(this[1]){this[1].i=0};
        
        //regular shift if there are 0,1 or 2 items in array
       return this.shift(); 
    }
    //remove the first element
    var r = this.shift();
    //put the last element first 
    this.unshift(this.pop()); 
    //update the index of the first element 
    this[0].i = 0; 
    //position of the element as it moves through the array, p2 is twice it.
    var pos = 0,p2;
    //the first two kids are at index 1 and 2 
    var kid1 = this[1]; 
    var kid2 = this[2]; 
    var v= this[pos]; 
    
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

Array.prototype.idxPt=function(a){
//special function to run through open list and return the index of a point. This happens when the f-score of a point in the open list has changed.  This is a pretty expensive method, so use the 'i' property that the shiftHeap, pushHeap, and updateHeap keep track of with each object if possible. 
    for(var i=0,l=this.length;i<l;i++){
        if(this[i].p==a.p){
            return i; 
        }
    }
    return -1; 
}
