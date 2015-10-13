"use strict";

meta.class("Assets.Room", "Room", 
{
	onInit: function() 
	{
		this.holder = new Assets.Holder();
		this.element.appendChild(this.holder.element);
	},

	onLoad: function() {
		this.holder.data = this.data;
	},

	onUnload: function() {

	},

	onResize: function() 
	{
		var style = this.element.style;
		style.width = editor.screenWidth + "px";
		style.height = editor.screenHeight + "px";
	},

	//
	name: "assets"
});