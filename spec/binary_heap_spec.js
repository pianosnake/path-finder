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

			console.log(_.pluck(h, 'i'))
			console.log(_.pluck(h, 'f'))
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
	})

	

	describe("#shift", function(){
		it("should return the first item", function(){
			var returnValue = h.shiftHeap();
			expect(returnValue.f).toEqual(10);
		});

		it("should remove the first item and put the next highest at the front", function(){
			h.shiftHeap();
			expect(h[0].f).toEqual(20);
		});

	})

	describe("#update", function(){
		it("should update the heap after an item's f-value changes", function(){
			h[2].f = 5; 
			h.updateHeap(2);
			expect(h[0].f).toEqual(5);
		});

	})
	

})