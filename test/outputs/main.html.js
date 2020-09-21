module.exports = function ($owner, $data, $model) {

if (!$owner) throw new Error("template must input $owner argument! file: d:\\dev\\jiac\\test\\inputs\\main.html")

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
				"databox",
				null,
				function (template, __data_list, __data_scope) {

					for (var $index = 0, __data_length = __data_list.length; $index < __data_length; $index++)
					{
						var $item = __data_list[$index];

						template($index, $item,
							[
								"text",
								null
							]
						);
					}

					// end function
				}
			],
			[
				"box",
				{
					"layout": "column",
					"flex": "auto",
					"tag": $owner.pipe("round: 2")($data.text + ' | round:2')
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
									"e-tap": "handleAppend"
								}
							],
							[
								"button",
								{
									"flex": "auto",
									"content": "Replace",
									"e-tap": "handleReplace"
								}
							],
							[
								"button",
								{
									"flex": "auto",
									"content": "Remove",
									"e-tap": "handleRemove"
								}
							],
							[
								"button",
								{
									"flex": "auto",
									"content": "Reorder",
									"e-tap": "handleReorder"
								}
							]
						]
					],
					[
						"databox",
						{
							"type": "model",
							"flex": "auto",
							"data": $model
						},
						function (template, __data_list, __data_scope) {

							for (var $index = 0, __data_length = __data_list.length; $index < __data_length; $index++)
							{
								var $item = __data_list[$index];

								template($index, $item,
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
																"text":  function ($pipe) { return $item.$index }
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
																"text":  function ($pipe) { return $item.name }
															}
														}
													],
													[
														"text",
														{
															"bindings": {
																"text":  function ($pipe) { return $item.value }
															}
														}
													],
													[
														"text",
														{
															"bindings": {
																"text":  function ($pipe) { return $item.computed }
															}
														}
													],
													[
														"databox",
														{
															"type": "model",
															"b-data": "$item.submodel",
															"item": "$subitem",
															"index": "$subindex"
														},
														function (template, __data_list, __data_scope) {

															var $item = __data_scope[0];
															var $index = __data_scope[1];

															for (var $subindex = 0, __data_length = __data_list.length; $subindex < __data_length; $subindex++)
															{
																var $subitem = __data_list[$subindex];

																template($subindex, $subitem,
																	[
																		"text",
																		{
																			"bindings": {
																				"text":  function ($pipe) { return $pipe("round:2")('index:' + $item.$index + '  subindex:' + $subitem.$index + '  text:' + $subitem.text); }
																			}
																		}
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
								);
							}

							// end function
						}
					]
				]
			]
		]
	]
)


}