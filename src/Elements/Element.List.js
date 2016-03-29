"use strict";

meta.class("Element.List", "Element.Basic",
{
	onCreate: function() 
	{
		this.items = [];

		this.domElement.onclick = this.handleClick.bind(this);
		this.domElement.oncontextmenu = this.handleContextMenu.bind(this);
		this.domElement.ondragenter = this.handleDragEnter.bind(this);
		this.domElement.ondragleave = this.handleDragLeave.bind(this);
		this.domElement.addEventListener("drop", this.handleDrop.bind(this), false);

		this.on("click", "item", this.selectItem.bind(this));
		this.on("click", "folder", this.selectItem.bind(this));
	},

	handleClick: function(domEvent) {
		this.emit("click", domEvent);
	},

	handleContextMenu: function(domEvent) {
		domEvent.stopPropagation();
		domEvent.preventDefault();
		this.emit("menu", domEvent);
	},	

	selectItem: function(event)
	{
		if(!this.selectable) { return; }

		if(this.selectedItem) {
			this.selectedItem.select = false;
		}

		this.selectedItem = event.element;
		this.selectedItem.select = true;
	},

	handleDragEnter: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.cache.dragItem;
		if(!dragItem) { 
			this.showDragStyle();
			return; 
		}
		this.append(dragItem);
	},

	handleDragLeave: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.cache.dragItem;
		if(!dragItem) { 
			this.hideDragStyle();
		}		
	},

	handleDrop: function(domEvent) 
	{
		domEvent.stopPropagation();
		domEvent.preventDefault();

		var dragItem = this.cache.dragItem;
		if(!dragItem) { 
			this.hideDragStyle();
		}	

		this.emit("drop", domEvent);
	},

	showDragStyle: function() {
		this.domElement.style.background = "#656565";	
	},

	hideDragStyle: function() {
		this.domElement.style.background = "";
	},

	createItem: function(name, insertBefore) 
	{
		if(!this.itemCls) {
			this.itemCls = Element.ListItem;
		}

		var item = new this.itemCls();
		item.name = name;

		if(insertBefore) {
			this.insertBefore(item, insertBefore);
		}
		else {
			this.append(item);
		}

		if(this._info) {
			this._info.enable = false;
		}

		this.items.push(item);

		return item;
	},

	removeItem: function(item) 
	{
		this.remove(item);

		var index = this.items.indexOf(item);
		if(index > -1) {
			this.items[index] = this.items[this.items.length - 1];
			this.items.pop();
		}

		if(this.domElement.childNodes.length === 0) {
			this.info = this.infoTxt;
		}
	},

	removeAll: function()
	{
		for(var n = 0; n < this.items.length; n++) {
			this.remove(this.items[n]);
		}

		this.items.length = 0;
		this.info = this.infoTxt;
	},

	sort: function()
	{
		if(!this.items) { return; }

		this.items.sort(this.sortFunc);

		var parentDomElement = this.domElement;
		var num = this.items.length;
		for(var n = 0; n < num; n++) {
			parentDomElement.appendChild(this.items[n].domElement);
		}
	},

	filterFunc: null,

	set info(str) 
	{
		this.infoTxt = str;

		if(!this._info) {
			this._info = new Element.Info(this);	
		}
		else {
			this._info.enable = true;
		}

		this._info.value = str;
	},

	get info() {
		return this._info.value;
	},

	set selectable(value) 
	{
		if(this._selectable === value) { return; }
		this._selectable = value;

		if(!value)
		{
			if(this.selectedItem) {
				this.selectedItem = false;
			}
		}
	},

	get selectable() {
		return this._selectable;
	},

	//
	elementTag: "list",

	items: null,
	itemCls: null,
	folderCls: null, 

	cache: {
		dragItem: null,
	},

	_info: null,
	infoTxt: null,

	_selectable: false,
	selectedItem: null
});