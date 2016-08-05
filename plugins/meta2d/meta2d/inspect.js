"use strict";

editor.plugin.meta2d.prototype.loadInspect = function()
{
	var inspect = editor.plugins.inspect;

	wabi.addFragment("inspect-sprite", "inspect-general", [
		{
			type: "section",
			name: "Transform",
			value: [		
				{
					type: "label",
					name: "Position",
					value: [
						{
							type: "taggedNumber",
							bind: "x",
							name: "x",
							color: "#D04031"
						},
						{
							type: "taggedNumber",
							bind: "y",
							name: "y",
							color: "#72B529"
						}					
					]
				},
				{
					type: "labelNumber",
					bind: "angle",
					name: "Angle"
				},
				{
					type: "label",
					name: "Scale",
					value: [
						{
							type: "taggedNumber",
							bind: "scaleX",
							name: "x",
							value: 1.0,
							color: "#D04031"
						},
						{
							type: "taggedNumber",
							bind: "scaleY",
							name: "y",
							value: 1.0,
							color: "#72B529"
						}
					]
				},
				{
					type: "label",
					name: "Anchor",
					value: [
						{
							type: "taggedNumber",
							bind: "anchorX",
							name: "x",
							value: 1.0,
							color: "#D04031"
						},
						{
							type: "taggedNumber",
							bind: "anchorY",
							name: "y",
							value: 1.0,
							color: "#72B529"
						}
					]
				}			
				// {
				// 	type: "labelDropdown",
				// 	name: "Texture",
				// 	bind: "texture",
				// 	dataset: [ "NORMAL", "STATIC", "DEBUG" ],
				// 	emptyOption: true
				// }				
			]
		},
		{
			type: "section",
			name: "Rendering",
			value: [
				{
					type: "labelNumber",
					bind: "z",
					name: "Sorting Index"
				},
				{
					type: "labelCheckbox",
					bind: "visible",
					name: "Visible",
					value: true
				}					
			]
		},
		{
			type: "section",
			name: "Texture",
			value: [
				{
					type: "labelDropdown",
					name: "Texture",
					bind: "texture",
					dataset: "assets.texture",
					emptyOption: true
				},
				{
					type: "label",
					name: "Pivot",
					value: [
						{
							type: "taggedNumber",
							bind: "pivotX",
							name: "x",
							value: 0.0,
							color: "#D04031"
						},
						{
							type: "taggedNumber",
							bind: "pivotY",
							name: "y",
							value: 0.0,
							color: "#72B529"
						}
					]
				}			
			]
		}
	]);

	wabi.addFragment("inspect-texture", "inspect-general", [
		{
			type: "section",
			name: "General",
			value: [
				{
					type: "labelCheckbox",
					bind: "premultiplied",
					name: "premultiplied",
					value: true
				}
			]
		},
	]);
};