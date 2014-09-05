describe("binary heap", function(){
	var h; 
	beforeEach(function(){
		h = [];
		h.pushHeap({f:30}); 
		h.pushHeap({f:20}); 
		h.pushHeap({f:34}); 
		h.pushHeap({f:38}); 
		h.pushHeap({f:30}); 
		h.pushHeap({f:34}); 
		h.pushHeap({f:10}); 
	});

	describe("#push", function(){
		it("the first item should have the lowest score", function(){
			expect(h[0].f).toEqual(10)
		});

		it("should push an item with the lowest f-score to the front", function(){
			h.pushHeap({f:4});
			expect(h[0].f).toEqual(4);
		});

		it("should not push an item with a higher f-score to the front", function(){
			h.pushHeap({f:11});
			expect(h[0].f).not.toEqual(11);
		});

		it("should return the length of the heap", function(){
			var oldLength = h.length; 
			var returnValue = h.pushHeap({f:123});
			expect(returnValue).toEqual(oldLength+1);
		});

		it("should keep track of indexes for easy parent calculation", function(){
			var indexes = _.pluck(h, 'i');
			expect(indexes).toEqual([0,1,2,3,4,5,6]);
		});
	})

	

	describe("#shift", function(){
		var returnValue; 
		beforeEach(function(){
			returnValue = h.shiftHeap();
		});
		
		it("should return the first item", function(){
			expect(returnValue.f).toEqual(10);
		});

		it("should remove the first item and put the next highest at the front", function(){
			expect(h[0].f).toEqual(20);
		});

		it("should keep indexes", function(){
			var indexes = _.pluck(h, 'i');
			expect(indexes).toEqual([0,1,2,3,4,5]);
		});

	})

	describe("#update", function(){
		it("should update the heap after an item's f-value changes", function(){
			h[2].f = 5; 
			h.updateHeap(2);
			expect(h[0].f).toEqual(5);
		});

		it("should keep indexes", function(){
			h.updateHeap(3);
			var indexes = _.pluck(h, 'i');
			expect(indexes).toEqual([0,1,2,3,4,5,6]);
		});

	})
	

})