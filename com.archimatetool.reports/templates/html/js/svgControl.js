var archiIdAttr = 'concept-id';
var viewIdAttr= 'view-id';
svgControl = {
	setElement: 'pathSource',
	source: '',
	target: '',
	svgScale: 1,
	svgX: 0,
	svgY: 0,
	bounds:[],
	lastNode:{},
	init: function() {
		// setup svg listeners
		downEvt = null;
		var archis = document.querySelectorAll('['+archiIdAttr+']');
		archis.forEach(function(a) {
			a.addEventListener("click", svgControl.archiClick); // select & highlight
			a.addEventListener("contextmenu", svgControl.archiContext); // set source, target, shortest, or breadth
		});;
		var archis = document.querySelectorAll('['+viewIdAttr+']');
		archis.forEach(function(a) {
			a.addEventListener("click", svgControl.viewClick); // select & highlight
		});

		svgRoot = document.querySelector('svg');
		this.bounds = svgRoot.getAttribute('viewBox').split(' ').map(Number);
		svgRoot.addEventListener("wheel", svgControl.archiWheel); // zoom in/out
		svgRoot.addEventListener("mousedown", svgControl.archiDown); // start pan
		svgRoot.addEventListener("mouseup", svgControl.archiUp); // end pan
		svgRoot.addEventListener("mouseleave", svgControl.archiUp); // end pan
		svgRoot.addEventListener("mousemove", svgControl.archiMove); // pan
		svgRoot.addEventListener("click", svgControl.archiClick); // unhighlight
		// svg pan and zoom
		svgControl.svgScale = 1;
		svgControl.svgX = 0;
		svgControl.svgY = 0;
		// setup context menu
		svgControl.setupContextMenu();
		svgControl.target = "";
		svgControl.menuBtns();
	},
	doShortestPath: function() {
		graph.setRelationships(shuttleMenu.include);
		menu.style.visibility="hidden";
		runShortestPath();
	},
	doBreadthFirst: function() {
		graph.setRelationships(shuttleMenu.include);
		menu.style.visibility="hidden";
		doBreadthFirst();
	},
	doRelationships: function(evt) {
	},
	doConfigure: function(evt) {
		shuttleMenu.init('shuttleMenu','Select relationships to use');
		shuttleMenu.addInput({type:'checkbox',name:'directed',label:'Directed',default:graph.getDirected()},svgControl.doDirected);
		shuttleMenu.setOkAction(svgControl.setGraphRelationships);
		shuttleMenu.setPosition((evt.pageX - 40) + "px", evt.pageY + "px");
	},
	doDirected: function(evt) {
		graph.setDirected(evt.target.checked);
	},
	setGraphRelationships: function() {
		graph.setRelationships(shuttleMenu.include);
		var newEdges = graph.filterEdges(edges);
		graph.reset();
		newEdges.forEach(function(e) {
			var directed = graph.getDirected();
			var src = e.source;
			var trg = e.target;
			if (e.type == "access-relationship" && e.accessType == 1) {
				src = e.target;
				trg = e.source;
			}
			if (e.type == "association-relationship" && e.directed) directed = e.directed;
			graph.addEdge(src,trg,directed,e.id);
		});
	},
	setupContextMenu: function(ele) {
		menu = document.getElementsByClassName("svgContextMenu")[0];
		while (menu.firstChild) {
			menu.removeChild(menu.firstChild);
		};
		if (runShortestPath) {
		  var button = svgControl.makeButton('Path from here', svgControl.setSource);
		  menu.appendChild(button);
		  if (typeof svgControl.source !== 'undefined') {
			button = svgControl.makeButton('Path to here', svgControl.doShortestPath);
			menu.appendChild(button);
		  }
		  button = svgControl.makeButton('Reachable from here', svgControl.doBreadthFirst);
		  menu.appendChild(button);
		  //button = svgControl.makeButton('Relationships', svgControl.doRelationships);
		  //menu.appendChild(button);
		  button = svgControl.makeButton('Manage relations', svgControl.doConfigure);
		  menu.appendChild(button);
		  svgControl.target = "";
		}
	},
	makeButton: function(label, action) {
		var div = document.createElement("div");
		div.classList.add("svgContextBtn");
		var textNode = document.createTextNode(label);
		div.appendChild(textNode);
		div.addEventListener("click", action);
		//div.appendChild(button);
		return div;
	},
	archiContext: function(evt) {
		evt.preventDefault();
		svgControl.setupContextMenu();
		svgControl.currentTarget = evt.currentTarget;
		svgControl.target = svgControl.currentTarget.getAttribute(archiIdAttr);
		svgControl.svgHighlight(svgControl.currentTarget.getAttribute(archiIdAttr));
		menu.style.left = (evt.pageX - 40) + "px";
		menu.style.top = evt.pageY + "px";
		menu.style.visibility = "visible";
		
		var box = menu.getBoundingClientRect();
		if (box.bottom > window.innerHeight) {
			menu.style.top = window.innerHeight - box.height +"px";
		}
		if (box.left < 0 ) {
			menu.style.left = "1px";
		}
		if (box.right >  window.innerWidth) {
			menu.style.left = window.innerWidth - box.width +"px";
		}
	},
	setSource: function() {
		svgControl.source = svgControl.currentTarget.getAttribute(archiIdAttr);
		//nodeSetElement('pathSource');
		menu.style.visibility = "hidden";
		svgControl.svgHighlight(svgControl.currentTarget.getAttribute(archiIdAttr), "highlightSource");
		// make sure the relationships are filter

	},
	setTarget: function() {
		svgControl.target = svgControl.currentTarget.getAttribute(archiIdAttr);
		//nodeSetElement('pathTarget');
		menu.style.visibility = "hidden";
	},
	archiWheel: function(evt) {
		evt.preventDefault();
		svgControl.svgScale += evt.deltaY * -0.001;
		svgControl.svgScale = Math.min(Math.max(.125, svgControl.svgScale), 4);
		svgControl.setTransform();
	},
	setTransform: function() {
		svgRoot.style.transform = "scale(" + svgControl.svgScale + ") translateX(" + svgControl.svgX + "px) translateY(" + svgControl.svgY + "px)";
	},
	archiDown: function(evt) {
		svgControl.svgDx = 0;
		svgControl.svgDy = 0;
		var t4m = svgRoot.style.transform;
		if (t4m.length > 0) {
			var t4ma = t4m.split(" ");
			svgControl.svgDx = parseFloat(t4ma[1].split("(")[1].split(")")[0]);
			svgControl.svgDy = parseFloat(t4ma[2].split("(")[1].split(")")[0]);
		}
		downEvt = evt;
	},
	archiUp: function(evt) {
		downEvt = null;
	},
	archiMove: function(evt) {
		if (downEvt) {
			svgControl.svgX = svgControl.svgDx + (evt.clientX - downEvt.clientX)/svgControl.svgScale;
			svgControl.svgY = svgControl.svgDy + (evt.clientY - downEvt.clientY)/svgControl.svgScale;
			// downEvt = evt;
			svgRoot.style.transform = "scale(" + svgControl.svgScale + ") translateX(" + svgControl.svgX + "px) translateY(" + svgControl.svgY + "px)";
		}
	},
	viewClick: function(evt) {
		var viewId = evt.target.getAttribute(viewIdAttr); 
		svgControl.setIFrame({
			id: viewId
			  },'view');

	},
	archiClick: function(evt) {
		//evt.stopPropagation();
		menu.style.visibility = "hidden";
		var archiId = evt.target.getAttribute(archiIdAttr);
		if (archiId) {
			var node = nodes[archiId];
			if (node) {
			  svgControl.lastNode = nodes[archiId];
			  svgControl.lastNode.id = archiId;
			  svgControl.nodeRelationships();
			}
			var docEv = svgControl.setIFrame({ id: archiId});
			if (archiId.split(':')[0] == 'view') {
			  svgControl.setIFrame({
				  id: archiId.split(':')[1]
			  },'view');
			}/* else {
			  svgControl.setIFrame({
				id: archiId
			  });
			}*/
			svgControl.svgHighlight();
			svgControl.svgHighlight(archiId);
			docEv.click();
			
			// make the documentation pane active
			/*
			var frame = window.parent.document.getElementsByTagName("iframe");
			alert(frame.src);
			var tbd = (frame.contentDocument) ? frame.contentDocument : frame.contentWindow.document;
			var tbb = tbd.getElementById("documentation");
			tbb.classList.add("active");
			*/
		}
	},
	svgHighlight: function(archiId, cssClass) {
		var cssClass = cssClass ? cssClass : "highlight";
		var selector = archiId ? '['+archiIdAttr+'="' + archiId + '"]' : '['+archiIdAttr+']';
		var highlite = archiId ? cssClass : '';
		var archis = document.querySelectorAll(selector);
		archis.forEach(function(a) {
			if (!(a instanceof SVGTextElement)) {
				a.setAttribute("class", highlite);
			}
		})
	},
	setIFrame: function(e,frame) {
		if (typeof frame == 'undefined') frame = 'element';
		var a = document.createElement('a');
		a.setAttribute('href', '../'+frame+'s/' + e.id + '.html');
		a.setAttribute('target', frame);
		if (nodes[e.id]) {
			a.innerText = nodes[e.id].documentation;
		}
		return a;
	},
	menuBtns: function() {
		var btnFit = document.getElementById("btnFit");
		btnFit.addEventListener("click",svgControl.fit);	
		/*
		var btnWidth = document.getElementById("btnWidth");
		var btnHeight = document.getElementById("btnHeight");
		btnWidth.addEventListener("click",svgControl.fitWidth);	
		btnHeight.addEventListener("click",svgControl.fitHeight);	
		*/
		var btnPrintable = document.getElementById("printable");
		btnPrintable.addEventListener("click",svgControl.printable);	
	},
	printable: function (evt) {
		var uri = document.location;
		window.alert("A new tab will be created\nfrom which the view may be printed\n(allow pop-ups if blocked)");
		window.open(uri);
	},
	fit: function(evt) {
		console.log('fit');
		svgControl.svgScale = 1;
		svgControl.svgX = 0;
		svgControl.svgY = 0;
		svgControl.setTransform();
	},

	fitWidth: function(evt) {
		console.log('width');
		downEvt = null;
		// set scale to match height
		var dX = svgControl.bounds[2] - svgControl.bounds[0];
		// grand parent is the container
		var pX = svgRoot.parentElement.parentElement.clientWidth;
		svgControl.svgScale = pX / dX;
		svgControl.setTransform();
	},
	fitHeight: function(evt) {
		console.log('height');
		downEvt = null;
		// set scale to match height
		var dY = svgControl.bounds[3] - svgControl.bounds[1];
		// grand parent is the container
		var pY = svgRoot.parentElement.parentElement.clientHeight;
		svgControl.svgScale = pY / dY;
		svgControl.svgX = -0.5 * svgControl.svgScale * (svgControl.bounds[2] - svgControl.bounds[0]);
		svgControl.setTransform();
	},
	nodeRelationships: function() {
		var nodeEdges = edges.filter(function(e) { 
			return e.source == svgControl.lastNode.id || e.target == svgControl.lastNode.id;
		});
		svgControl.lastNode.edges = nodeEdges;

	}
}


