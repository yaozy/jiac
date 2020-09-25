module.exports = function ($owner, $data, $model) {

if (!$owner) throw new Error("template must input $owner argument! file: d:\\dev\\jiac\\test\\inputs\\main.html")

return (
	[
		"page",
		null,
		[
			require("../components/header.html")($owner, $data, $model),
			[
				"masklayer",
				{
					"text": $model.text
				}
			],
			[
				"box",
				{
					"width": "550rem",
					"absolute": "middle center",
					"padding": "50rem",
					"theme": "bg-standard"
				},
				[
					[
						"textbox",
						{
							"placeholder": "姓名",
							"width": "100%",
							"text-align": "center",
							"bindings": {
								"value":  function () { return $model.name },
								"onchange":  function (value) { $model.name = value; }
							}
						}
					],
					[
						"textbox",
						{
							"placeholder": "性别",
							"width": "100%",
							"text-align": "center",
							"bindings": {
								"value":  function () { return $model.gendle },
								"onchange":  function (value) { $model.gendle = value; }
							}
						}
					],
					[
						"textbox",
						{
							"placeholder": "电话",
							"width": "100%",
							"text-align": "center",
							"bindings": {
								"value":  function () { return $model.tel },
								"onchange":  function (value) { $model.tel = value; }
							}
						}
					],
					[
						"textbox",
						{
							"placeholder": "地址",
							"width": "100%",
							"text-align": "center",
							"bindings": {
								"value":  function () { return $model.address },
								"onchange":  function (value) { $model.address = value; }
							}
						}
					],
					[
						"textbox",
						{
							"placeholder": "楼宇门牌",
							"width": "100%",
							"text-align": "center",
							"bindings": {
								"value":  function () { return $model.house },
								"onchange":  function (value) { $model.house = value; }
							}
						}
					],
					[
						"button",
						{
							"margin-top": "50rem",
							"events": {
								"tap": $owner.handleOK.bind($owner)
							}
						},
						"确认"
					]
				]
			]
		]
	]
)


}