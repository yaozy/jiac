module.exports = function (data) {


return (
	[
		"box",
		{
			"theme": "level1",
			"style": "margin-top:10rem;padding:0 20rem;"
		},
		[
			[
				"text",
				{
					"text": '￥' + data.price + this.fn(a, b),
					"theme": "primary",
					"style": "float:right;",
					"bindings": {
						"text":  function (data) { return data.a + 1 },
						"value":  function (data) { return data.b + 2 }
					}
				}
			],
			[
				"box",
				null,
				(function (__for_list) {

				    var __for_data = [];

				    for (var index = 0, __for_len = __for_list.length; index < __for_len; index++)
				    {
				        var item = __for_list[index];

				        __for_data.push.apply(__for_data,
							[
								[
									"box",
									{
										"tag": item.id,
										"style": "height:160rem;margin:20rem 0;overflow:hidden;"
									},
									[
										[
											"image",
											{
												"src": item.image,
												"style": "width:200rem;height:100%;"
											}
										],
										[
											"box",
											{
												"style": "display:inline-block;width:500rem;height:100%;padding-left:20rem;"
											},
											[
												[
													"band",
													{
														"style": "height:50rem;overflow:hidden;"
													},
													[
														[
															"text",
															{
																"text": item.name
															}
														]
													]
												],
												[
													"band",
													{
														"theme": "level4",
														"style": "height:70rem;font-size:24rem;overflow:hidden;"
													},
													[
														[
															"text",
															{
																"text": item.remark
															}
														]
													]
												],
												[
													"band",
													{
														"theme": "primary",
														"style": "height:40rem;overflow:hidden;"
													},
													[
														[
															"text",
															{
																"text": '￥' + item.price
															}
														]
													]
												]
											]
										]
									]
								]
							] || []);
				    }

				    return __for_data;

				}).call(this, data)
			]
		]
	]
)


}