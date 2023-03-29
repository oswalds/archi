function Graph() {
  // constructs a graph for breadth first and shortest path analysis
  // 
  var neighbors = this.neighbors = {}; // Key = vertex, value = array of neighbors.
  var relationships = this.relationships = [];
  var directedGraph = false;
  this.setDirected = function(directed) {
	  directedGraph = directed;
  };
  this.getDirected = function() {
	  return directedGraph;
  };
  // add from (u) and to (v) nodes of edge
  this.addEdge = function (u, v, directed, id) {
    directed = typeof directed !== 'undefined' ? directed : directedGraph;
    id = typeof id !== 'undefined' ? id : '';
    // add forward direction of edge
    if (neighbors[u] === undefined) {  // Add the edge u -> v.
      neighbors[u] = [];
    }
    neighbors[u].push({ vertex: v, link: id });
    // add opposite direction for undirected graph
    if (! directed) {
      if (neighbors[v] === undefined) {  
        neighbors[v] = [];              
      }                                
      neighbors[v].push({ vertex: u, link: id });           
    }
  };
  // only consider the relationships set
  this.setRelationships = function (rs) {
	  relationships = rs;
  }
  // filter input array of edges against set relationships
  this.filterEdges = function (edges) {
	  if (relationships.length == 0) return edges;
	  var outEdges = edges.filter(function(e) {
		  return relationships.includes(e.type);
	  });
	  return outEdges;
  }
  this.reset = function () {
	  neighbors = this.neighbors = [];
  }
  return this;
}

function breadthFirst (graph, source) {
  // construct a breadth first tree starting from source
	// queue contains nodes of form { vertex: node, count: n, from: node, link: edge }
  var queue = [ { vertex: source, count: 0, from: '', link:'' } ],
      visited = [],
      tail = 0;
  visited[source] = true;
  try {
  while (tail < queue.length) {
    var u = queue[tail].vertex,
        count = queue[tail++].count;  
    if (graph.neighbors[u]) {
      graph.neighbors[u].forEach(function (vn) {
	v = vn.vertex;
        if (!visited[v]) {
          visited[v] = true;
          queue.push({ vertex: v, count: count + 1, from: u, link: vn.link});
        }
      });
    }
  }
  } catch (e) {
	  console.log(e);
  }
  return queue;
}

// return the path of ordered nodes (aka vertices) from a graph
// between a source and a target node
// node is of form { vertex: node, count: n, link: edge}
// where node is the edge node and count is the steps to reach the end
function shortestPath(graph, source, target) {
  var count = 0;
  if (source == target) {   
    return [];            
  }                      
  var queue = [ source ];
  var visited = { source: true };
  var predecessor = {};
  var tail = 0;
  try {
    while (tail < queue.length) {
      var u = queue[tail++],  // Pop a vertex off the queue.
      neighbors = graph.neighbors[u];
      if (neighbors) {
	for (var i = 0; i < neighbors.length; ++i) {
          var v = neighbors[i].vertex;
          var e = neighbors[i].link;
          if (visited[v]) {
            continue;
          }
          visited[v] = e; // use the link to indicated vertex has been visited
          if (v === target) {   // path traced
            var path = [ {'vertex':v, 'count':count, 'link':visited[v]} ];   // If so, backtrack through the path.
            while (u !== source) {
	      count++;
              path.push( { 'vertex':u, 'count':count, 'link':visited[u]});
              u = predecessor[u];
            }
	    count++;
            path.push( { 'vertex':u, 'count':count});//,'link':visited[u]});
            path.reverse();
            return path;
          } 
          predecessor[v] = u;
          queue.push(v);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  return [];
}
function friction(edges) {
	edges.forEach(function (e) {
		e.friction = relationshipFriction[e.type];
	});
	return edges;
}
function edges2pts(edges) {
	var pts = [];
	for (edge of edges) {
		for (end of ["source","target"]) {
			var pt = pts[edge[end]];
			if (pt === undefined) {
				pt = {"id":edge[end],"edges":[]};
			}
			pt.edges.push({"id":edge.id,"source":edge.source,"target":edge.target,"distance":edge.friction});
			pts[edge[end]] = pt;
		}
	}

	return pts;
}
function edges2wGraph (edges) {
	var wGraph = {};
	for (edge of edges) {
		var target = edge.target;
		var source = edge.source;
		var friction=edge.friction;
		var t = {};
		t[target] = {"distance":friction,"name":target,"edge":edge};
		var s = {}; 
		s[source] = {"distance":friction,"name":source,"edge":edge};
		if (! wGraph[source]) { wGraph[source] = {}; }
		wGraph[source] = Object.assign(wGraph[source],t);
		if (!graph.getDirected()) {
			if (! wGraph[target]) { wGraph[target] = {}; }
			wGraph[target] = Object.assign(wGraph[target],s);
		}
	}
	let gIndices = Object.keys(wGraph);
	for (g in gIndices) {
		let keys = Object.keys(wGraph[gIndices[g]]);
		var thing = wGraph[gIndices[g]];
		console.log(nodes[gIndices[g]].name);
		console.log("    distances to:");
		for (key  in keys) {
			console.log("   ",nodes[keys[key]].name,thing[keys[key]]);
		}
	}
	return wGraph;
}

function shortestDistanceNode  (distances, visited)  {
  // create a default value for shortest
	let shortest = null;
  	// for each node in the distances object
	for (let node in distances) {
    		// if no node has been assigned to shortest yet
  		// or if the current node's distance is smaller than the current shortest
		let currentIsShortest = shortest === null || distances[node] < distances[shortest];
	  	// and if the current node is in the unvisited set
		if (currentIsShortest && !visited.includes(node)) {
            		// update shortest to be the current node
			shortest = node;
		}
	}
	return shortest;
}

function findShortestPath (graph, startNode, endNode)  {
	// graph - { node1: { neighbor1 : distance, neighbor2 : distance, ...}, node2 {}...}
        // startNode - node id of path start
	// endNode - node id of destination
	// returns results - { distance: distance, path: [{node: nodeId, edge: edge},{}...}]
	let distances = [];
	let edges = [];
	distances[endNode] = Infinity;
	for (let obj in graph[startNode]) {
		distances[obj] = graph[startNode][obj].distance;
	}
	//distances = Object.assign(distances, graph[startNode]);
	// track paths using a hash object
	let parents = { endNode: null };
	for (let child in graph[startNode]) {
		parents[child] = startNode;
		edges[child] = graph[startNode][child];
	}
	// collect visited nodes
	let visited = [];
	// find the nearest node
	let node = shortestDistanceNode(distances, visited);

	// for that node:
	while (node) {
		// find its distance from the start node & its child nodes
		let distance = distances[node];
		let children = graph[node];
		// for each of those child nodes:
		for (let child in children) {
			// make sure each child node is not the start node
			if (String(child) === String(startNode)) {
				continue;
			} else {
				// save the distance from the start node to the child node
				let newdistance = distance + children[child].distance;
				// if there's no recorded distance from the start node to the child node in the distances object
				// or if the recorded distance is shorter than the previously stored distance from the start node to the child node
          			if (!distances[child] || distances[child] > newdistance) {
					// save the distance to the object
					distances[child] = newdistance;
					// record the path
					parents[child] = node;
					edges[child] = graph[node][child];
				} 
			}
		}  
		// move the current node to the visited set
		visited.push(node);
		// move to the nearest neighbor node
		node = shortestDistanceNode(distances, visited);
    }
  
 // using the stored paths from start node to end node
 // record the shortest path
 var edgeId = edges[endNode] ? edges[endNode].edge.id : undefined;
 var count = edges[endNode] ? edges[endNode].edge.friction : undefined;
 let shortestPath = [{"vertex":endNode,"link":edgeId}];
 let parent = parents[endNode];
 while (parent) {
  edgeId = edges[parent] ? edges[parent].edge.id : undefined;
  count = edges[parent] ? edges[parent].edge.friction : undefined;
  shortestPath.push({"vertex":parent,"link":edgeId});
  parent = parents[parent];
 }
 shortestPath.reverse();
  
 //this is the shortest path
 let results = {
  distance: distances[endNode],
  path: shortestPath,
 };
 // return the shortest path & the end node's distance from the start node
   return results;
};

function dijkstra(pts,source) {  
	// pts is array of all nodes;
	// each node has an array of edges;
	// each edge has a source, target, and distance
  const Q = new Set();
  const dist = new Map();
  const prev = new Map();
  const prevEdge = new Map();
  
//  pts.forEach(pt => {
  var keys = Object.keys(pts);
  keys.forEach(function(key) {
    pt = pts[key];
    dist.set(pt.id, Infinity);
    prev.set(pt.id, undefined);
    Q.add(pt.id);
  });
  
  dist.set(source, 0);
  
  while (Q.size) {
    // Find the node with least distance.
    let u, minDistance = Infinity;
    for (const candidate of Q) {
      if (dist.get(candidate) < minDistance) {
        minDistance = dist.get(candidate);
        u = candidate;
      }
    }
    if (typeof u !== "undefined") {
      // Remove it from the visited queue.
      Q.delete(u);
      var uEdges = pts[u].edges;
      for (const edge of uEdges) {
        const v = edge.source === u ? edge.target : edge.source;
        const alt = dist.get(u) + edge.distance;
        if (alt < dist.get(v)) {
          dist.set(v, alt);
          prev.set(v, u);
          prevEdge.set(v, edge);
	}
      }
    }
  }
  return {dist, prev, prevEdge};
}
function dijkstraSP (dijkstraObj,source,target) {
	console.log("dijkstraSP");
	var count = 0;
	var cost = 0;
	var path = [ {'vertex':target, 'count':count, 'link':dijkstraObj.prevEdge.get(target).id} ];
	console.log("target:",nodes[target].name);
	var prev = dijkstraObj.prev.get(target);
	while(prev) {
		console.log("prev:",nodes[prev].name);
		var prEdge = dijkstraObj.prevEdge.get(prev);
		cost += dijkstraObj.dist.get(prev);
		if (typeof prEdge !== "undefined") {
			path.push({'vertex':prev,'count':++count,'link':dijkstraObj.prevEdge.get(prev).id});
		} else {
			path.push({'vertex':prev,'count':++count});//,'link':dijkstraObj.prevEdge.get(prev).id});
		}
		console.log(nodes[prev]);
		prev = dijkstraObj.prev.get(prev);
	}
	console.log("cost: "+ cost);
	return path.reverse();
}
function runShortestPath(evt) {
	if (typeof evt !== 'undefined') evt.preventDefault();
	source = svgControl.source;
	console.log("source:("+source+")",nodes[source]);
	target = svgControl.target;
	console.log("target:("+target+")",nodes[target]);
	svgControl.svgHighlight();
	menu.style.visibility="hidden";
	// get reachable nodes
	var reachable = breadthFirst(graph,source);
	var reachableEdges = edges.filter(function(e) { 
		return reachable.find(function(f) { 
			return f.vertex === e.source || f.vertex === e.target;
		});
	});
	// set up friction
	var pts = edges2pts(friction(reachableEdges));
	var wGraph = edges2wGraph(friction(reachableEdges));
	// calculate dijkstra's distances
	//var dijkstraObj = dijkstra(pts,source);
	var results = findShortestPath(wGraph,source,target);
	// get the shortest path
	var path = shortestPath(graph, source, target);
	//var path = dijkstraSP(dijkstraObj,source,target);
	displayPath(results.path);
}
function doBreadthFirst() {
	if (typeof evt !== 'undefined') evt.preventDefault();
	source = svgControl.target;
	svgControl.svgHighlight();
	menu.style.visibility="hidden";
	var path = breadthFirst(graph, source);
	displayPath(path, true);
}
function displayPath(path, displayCount) {
	var relAss = getRelAssoc(edges);
	var graphTitle= document.getElementById("graphTitle");
	var graphResults = document.getElementById("graphResults");
	graphTitle.innerHTML = displayCount ? 'Depth tree from '+nodes[source].name+'.' : 'Shortest path from '+nodes[source].name+" to "+nodes[target].name+".";
	graphResults.innerHTML = 'No path found'; // default in case nothing is found
	if (path.length === 0) return;
	
	var innerHTML = "<p>Relationships considered: "+shuttleMenu.rightList.join(";")+"<br>";
	innerHTML += "<table class='table table-striped table-hover table-condensed' style='empty-cells:show;'>";
	innerHTML += '<tr>';
	if (displayCount) {
		innerHTML += '<th>Level</th>';
	}
	var baseCells = displayCount ? 4 : 3;
	var maxCells = baseCells;
	path.forEach(function(p) {
		var node = nodes[p.vertex];
		if (node) {
		  var props = nodes.properties;
		  if (props) maxCells = maxCells < baseCells + props.length ? baseCells + props.length : maxCells;
		}
	});
	var addCells = maxCells - baseCells;
	//innerHTML += '<th>Name</th><th>Documentation</th><th>Properties</th>';
	innerHTML += '<th>Name</th><th>Documentation</th><th>Properties</th>';
	for (var i=0;i<addCells;i++) {innerHTML += '<th></th>';}
	innerHTML += '</tr>';
//	function getEdge (linkId) { return edges.filter( edge => edge.id === linkId)[0];}
	path.forEach(function(p,i) {
		var ncells = 0;
		var ele = '<tr>';
		if (displayCount) {ncells++; ele += '<td>' + p.count + '</td>';}
		var node = nodes[p.vertex];
		if (node) {
			ele += "<td><a href='../elements/" + p.vertex + ".html' target='element'>" + nodes[p.vertex].name + "</a></td>";
			ele += "<td>"+nodes[p.vertex].documentation+"</td>";
		}
		if (i==0) {
			svgControl.svgHighlight(p.vertex,"highlightSource");
		} else if ( i == (path.length-1)) {
			svgControl.svgHighlight(p.vertex,"highlightTarget");
		} else {
			svgControl.svgHighlight(p.vertex,"highlight");
		}
		var relation=0;
		if (p.link) {
			svgControl.svgHighlight(p.link);
			relation = edges.filter( edge => edge.id === p.link)[0];
			relation.cardinality = relation.source === p.vertex ? 1 : 0;
			relation.symbol = relation.source === p.vertex ? "&uarr; &#32;" : "&darr; &#32;";
			relation.verbLabel = relationshipVerb[relation.type];
			relation.verbLabel = relation.accessType ? relationshipVerb[relation.type][relation.accessType] : relationshipVerb[relation.type][relation.cardinality];
		}
		ncells++;
		/*
		if (nodes[p.vertex]) {
			//ele += "<td>" + nodes[p.vertex].documentation + "</td>";
			ele += relation ? "<td>" + relation.symbol+relation.label + "</td>" : "<td>origin</td>" ;
		} else {
			ele += "<td></td>";
		}
		*/
		ncells++;
		if (nodes[p.vertex]) {
			ele += "<td>";
			nodes[p.vertex].properties.forEach(function(prop) {
				ele += "<i>" + prop.key + "</i>:" + prop.value + "; ";
				ncells++;
			});
			ele += "</td>";
		}
		if (ncells < maxCells) {
			for (var i=ncells;i<maxCells;i++) ele += '<td></td>';
		}
		if (relation) {
			innerHTML += "<tr><td><i><a href='../elements/" + relation.id + ".html' target='element'>"+relation.symbol+"    "+relation.verbLabel+"</a></i></td><td>";
			if (relAss[p.link]) {
				innerHTML += " associated with ";
				relAss[p.link].forEach(function(l) {
					//innerHTML += "<b>"+nodes[l].name+", documentation: "+nodes[l].documentation+"</b>; ";
					innerHTML += nodes[l].documentation;
					if (nodes[l].properties.length > 0 ) {
						innerHTML +="<td>";
						nodes[l].properties.forEach(function(p) {
							if (p.key.length>0) innerHTML += "<i>" + p.key + "</i>:" + p.value+"; ";
						});
						innerHTML +="</td>";
					}
				});
			}
			if (relation.properties.length>0) {
				innerHTML += "<td>";
				relation.properties.forEach(function(p) {
					if (p.key.length>0) innerHTML += "<i>" + p.key + "</i>:"+ p.value +"; ";
				});
				innerHTML += "</td>";
			}
			innerHTML += "</td><td></td></tr>";
		} 
		innerHTML += ele + "</tr>";
	});
	innerHTML += "</table>";
	graphResults.innerHTML = innerHTML;
}
function getRelAssoc(edges) {
	// returns an array of arrays that have the ids of the objects associated with a realtionship
	var relAssoc = [];
	edges.forEach(function(e) {
		if (e.sourceType.includes('Relationship')) {
			if (relAssoc[e.source]) {
				relAssoc[e.source].push(e.target);
			} else {
				relAssoc[e.source] = [e.target];
			}
		}
		if (e.targetType.includes('Relationship')) {
			if (relAssoc[e.target]) {
				relAssoc[e.target].push(e.source);
			} else {
				relAssoc[e.target] = [e.source];
			}
		}

	});
	return relAssoc;
}






