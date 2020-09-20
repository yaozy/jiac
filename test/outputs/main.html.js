module.exports = function (owner, data) {


return (
	[
		"page",
		null,
		[
			[
				"header",
				{
					"content": "yaxi model page"
				}
			],
			[
				"box",
				{
					"layout": "column",
					"flex": "auto"
				},
				[
					[
						"box",
						{
							"layout": "row",
							"background-color": "@bg-level2-color"
						},
						[
							[
								"button",
								{
									"flex": "auto",
									"content": "Append",
									"events": {
										"tap": owner.handleAppend.bind(owner)
									}
								}
							],
							[
								"button",
								{
									"flex": "auto",
									"content": "Replace",
									"events": {
										"tap": owner.handleReplace.bind(owner)
									}
								}
							],
							[
								"button",
								{
									"flex": "auto",
									"content": "Remove",
									"events": {
										"tap": owner.handleRemove.bind(owner)
									}
								}
							],
							[
								"button",
								{
									"flex": "auto",
									"content": "Reorder",
									"events": {
										"tap": owner.handleReorder.bind(owner)
									}
								}
							]
						]
					],
					[
						"modelbox",
						{
							"flex": "auto",
							"scope": ""
						},
						[
							[
								"box",
								{
									"height": "200rem"
								},
								[
									[
										"box",
										{
											"width": "50rem",
											"height": "120rem",
											"line-height": "120rem",
											"position": "absolute",
											"top": "0",
											"left": "20rem"
										},
										[
											[
												"text",
												{
													"bindings": {
														"text": "$index"
													}
												}
											]
										]
									],
									[
										"box",
										{
											"height": "180rem",
											"width": "700rem",
											"position": "absolute",
											"left": "70rem",
											"top": "20rem"
										},
										[
											[
												"text",
												{
													"width": "200rem",
													"bindings": {
														"text": "$item.name"
													}
												}
											],
											[
												"text",
												{
													"bindings": {
														"text": "$item.value"
													}
												}
											],
											[
												"text",
												{
													"bindings": {
														"text": "$item.computed"
													}
												}
											],
											[
												"databox",
												{
													"scope": "",
													"bindings": {
														"data": "$item.submodel"
													}
												},
												function (controls, __loop_data, __loop_scope) {


												    for (var $index = 0, __loop_len = __loop_data.length; $index < __loop_len; $index++)
												    {
												        var $item = __loop_data[$index];

												        this.loadTemplate(controls, __loop_scope, $index, $item,
															[
																[
																	"text",
																	{
																		"bindings": {
																			"text":  function ($pipe) { return 'index:' + this.$index + '  subindex:' + this.$top.$subindex + '  text:' + this.$top.$subitem.text }
																		}
																	}
																]
															]
														);
												    }

												    // end function
												}
											]
										]
									]
								]
							]
						]
					]
				]
			]
		]
	]
)


}