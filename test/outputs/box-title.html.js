module.exports = function () {


return (
	[
		"band",
		null,
		[
			[
				"icon",
				{
					"icon": this.icon
				}
			],
			[
				"text",
				{
					"text": this.text
				}
			],
			[
				"box",
				null,
				[
					[
						"text",
						null,
						"查看更多"
					],
					[
						"icon",
						{
							"icon": "common-more"
						}
					]
				]
			]
		]
	]
)


}