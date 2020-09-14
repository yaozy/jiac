module.exports = function (scope) {


return (
	[
		"page",
		{
			"events": {
				"tap": handleTap
			}
		},
		[
			[
				"header",
				{
					"content": "yaxi test page"
				}
			],
			[
				"box",
				null,
				[
					[
						"button",
						{
							"tag": "model.js"
						}
					],
					[
						"text",
						null,
						"open"
					],
					[
						"text",
						{
							"text": "model",
							"theme": "danger-font",
							"style": "margin-left:2em;font-weight:bold;"
						}
					],
					[
						"button",
						{
							"tag": "test.js"
						}
					],
					[
						"text",
						null,
						"open"
					],
					[
						"text",
						{
							"text": "test",
							"theme": "danger-font",
							"style": "margin-left:2em;font-weight:bold;"
						}
					]
				]
			]
		]
	]
)


}