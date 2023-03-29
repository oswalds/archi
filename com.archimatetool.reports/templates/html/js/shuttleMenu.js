shuttleMenu = {
	title:"Title",
	popup:{},
	shuttleMenu:{},
	controlContainer:{},
	listContainer:{},
	leftList:[],
	rightList:[],
	saveLeft:[],
	saveRight:[],
	okAction:function(){console.log('ok');},
	init : function(div,title,leftList,rightList) {
		this.title = title;
		if (this.leftList.length == 0 && this.rightList.length == 0) {
		  if (typeof leftList === 'undefined') {
		    rightList = ['flow-relationship','access-relationship','association-relationship'];
		    leftList = archiObjects.relationships.filter(function(e) {
			return rightList.indexOf(e) < 0;
		    });
		  }
		  this.rightList = rightList;
		  this.leftList = leftList;
		}
		this.saveRight = this.rightList;
		this.saveLeft = this.leftList;
		this.shuttleListMenu(div,this.ok,this.cancel);
	},
	addInput: function (input,listener) {
		// input: {type:'checkbox', name:'nameText', label:'text', default:'value'}
		var inputElement = document.createElement('input');
		inputElement.type= input.type;
		inputElement.name= input.name;
		if (input.type=='checkbox') inputElement.checked = input.default;
		var inputLabel = document.createTextNode(input.label);
		inputElement.addEventListener('change',listener);
		var inputDiv = document.createElement('div');
		inputDiv.appendChild(inputElement);
		inputDiv.appendChild(inputLabel);
		this.controlContainer.appendChild(inputDiv);
	},
	setOkAction: function(action) {
		this.okAction = action;
	},
	setPosition: function(leftPx,topPx) {
		this.popup.style.left= leftPx;
		this.popup.style.top = topPx;
		// force into window
		var left = parseInt(leftPx);
		var top = parseInt(topPx);
		var box = this.popup.getBoundingClientRect();
		if (box.bottom > window.innerHeight) top = window.innerHeight - box.height;
		if (box.left < 0) left = 1;
		if (box.right > window.innerWidth) left = window.innerWidth - box.width;
		this.popup.style.left= left+"px";
		this.popup.style.top = top+"px";

	},
	ok: function(evt) {
		shuttleMenu.clear();
		shuttleMenu.okAction();
	},
	cancel: function(evt) {
		shuttleMenu.leftList = shuttleMenu.saveLeft;
		shuttleMenu.rightList = shuttleMenu.saveRight;
		shuttleMenu.clear();
	},
	clear: function() {
		shuttleMenu.popup.style.visibility = 'hidden';
		shuttleMenu.include = shuttleMenu.rightList;
	},
	shuttleListMenu: function (div,okListener,cancelListener) {
		var popup = document.getElementById(div);
		popup.addEventListener("mouseleave",this.mouseLeave);
		while(popup.firstChild) { popup.removeChild(popup.firstChild);}
		popup.style.visibility='visible';
		this.shuttleMenu = document.createElement('div');
		this.controlContainer = document.createElement('div');
		this.listContainer = document.createElement('div');
		var title = document.createElement('div');
		title.addEventListener("mousedown",this.mouseDown);
		title.addEventListener("mouseup",this.mouseUp);
		title.addEventListener("mousemove",this.mouseMove);
		var controls = document.createElement('div');
		title.innerHTML = this.title;
		title.classList.add('title');
		this.listContainer.classList.add('container');
		popup.appendChild(title);
		this.shuttleLists(this.leftList,this.rightList);
		this.controlContainer.classList.add('controls');
		var okButton = document.createElement('button');
		var cancelButton = document.createElement('button');
		okButton.classList.add('okCancel');
		okButton.innerHTML = 'ok';
		okButton.addEventListener('click',okListener);
		cancelButton.classList.add('okCancel');
		cancelButton.innerHTML = 'cancel';
		cancelButton.addEventListener('click',cancelListener);
		controls.appendChild(okButton);
		controls.appendChild(cancelButton);
		controls.classList.add('okCancel'); 
		this.controlContainer.appendChild(this.listContainer);
		//this.controlContainer.appendChild(controls);
		popup.appendChild(this.controlContainer);
		popup.appendChild(controls);
		this.popup = popup;
	},
	// TODO refactor to work on lists directly
	shuttleLists: function(leftList,rightList) {
		while(this.listContainer.firstChild) { this.listContainer.removeChild(this.listContainer.firstChild);}
		var leftListDiv = document.createElement('div');
		leftListDiv.classList.add('list');
		leftListDiv.classList.add('leftList');
		var controlDiv = document.createElement('div');
		controlDiv.classList.add('controlCenter');
		var moveAllLeftBtn = document.createElement('button');
		moveAllLeftBtn.innerHTML = "<<";
		moveAllLeftBtn.classList.add("shuttle");
		moveAllLeftBtn.addEventListener("click",this.moveAllLeft);
		controlDiv.appendChild(moveAllLeftBtn);
		var moveAllRightBtn = document.createElement('button');
		moveAllRightBtn.innerHTML = ">>";
		moveAllRightBtn.classList.add("shuttle");
		moveAllRightBtn.addEventListener("click",this.moveAllRight);
		controlDiv.appendChild(moveAllRightBtn);
		var rightListDiv = document.createElement('div');
		rightListDiv.classList.add('list');
		rightListDiv.classList.add('rightList');
		leftListDiv.appendChild(this.createMenuList(leftList,this.moveRight));
		rightListDiv.appendChild(this.createMenuList(rightList,this.moveLeft));
		this.listContainer.appendChild(leftListDiv);
		this.listContainer.appendChild(controlDiv);
		this.listContainer.appendChild(rightListDiv);
	},
	moveAllLeft: function (evt) {
		shuttleMenu.shuttleAll('left');
	},
	moveAllRight: function (evt) {
		shuttleMenu.shuttleAll('right');
	},
	moveLeft: function (evt) {
		var v = evt.target.textContent;
		shuttleMenu.shuttle(v,'left');
	},
	moveRight: function (evt) {
		var v = evt.target.textContent;
		shuttleMenu.shuttle(v,'right')
	},
	mouseDown: function (evt) {
		shuttleMenu.moving = true;
		shuttleMenu.offset = {
			x: shuttleMenu.popup.offsetLeft - evt.clientX,
			y: shuttleMenu.popup.offsetTop - evt.clientY
		};
	},
	mouseMove: function (evt) {
		evt.preventDefault();
		if (shuttleMenu.moving) {
			shuttleMenu.popup.style.left = (evt.clientX + shuttleMenu.offset.x)+'px';
			shuttleMenu.popup.style.top = (evt.clientY + shuttleMenu.offset.y)+'px';
		}
	},
	mouseLeave: function (evt) {
		shuttleMenu.moving = false;
	},
	mouseUp: function (evt) {
		shuttleMenu.moving = false;
	},
	shuttle: function (v,dir) {
		if (dir == 'left') {
			// rightList moves to leftList
			var idx = this.rightList.indexOf(v);
			this.rightList.splice(idx,1);
			this.leftList.push(v);
		} else {
			// leftList moves to rightList
			var idx = this.leftList.indexOf(v);
			this.leftList.splice(idx,1);
			this.rightList.push(v);
		}
		//shuttleMenu.popup.appendChild(this.shuttleLists(this.leftList,this.rightList));
		this.shuttleLists(this.leftList,this.rightList);
	},
	shuttleAll: function (dir) {
		if (dir == 'left') {
			var leftList = this.leftList.concat(this.rightList);
			this.leftList = leftList;
			this.rightList = [];
		} else {
			var rightList = this.rightList.concat(this.leftList);
			this.rightList = rightList;
			this.leftList = [];
		}
		this.shuttleLists(this.leftList,this.rightList);
	},
	createMenuList: function (items,listener) {
		var list = document.createElement('ul');
		list.classList.add('menuList');
		items.sort().forEach(function(it) { //for (var i=0;i<5;i++) {
			var item = document.createElement('li');
			item.classList.add('menuItem');
			var txtNode = document.createTextNode(it);
			item.appendChild(txtNode);
			list.appendChild(item);
			if (typeof listener !== 'undefined') {
				item.addEventListener("click",listener);
			}
		});
		return list;

	}
}



