module.exports = function () {


return (
	[
		"box",
		{
			"theme": "level5-bg"
		},
		[
			[
				"swiper",
				null,
				[
					[
						"image",
						{
							"src": "/images/splash-screen.jpg"
						}
					],
					[
						"image",
						{
							"src": "/images/splash-screen.jpg"
						}
					],
					[
						"image",
						{
							"src": "/images/splash-screen.jpg"
						}
					],
					[
						"image",
						{
							"src": "/images/splash-screen.jpg"
						}
					]
				]
			],
			[
				"band",
				{
					"style": "height:60rem;"
				}
			],
			[
				"band",
				{
					"theme": "level1",
					"style": "height:100rem;margin-top:10rem;padding:10rem 20rem;"
				},
				[
					[
						"button",
						{
							"theme": "level4",
							"style": "line-height:80rem;border-radius:80rem;border:.5px solid @border-level4-color",
							"events": {
								"tap": this.handleSearch
							}
						},
						[
							[
								"icon",
								{
									"icon": "common-search"
								}
							],
							[
								"text",
								null,
								"搜索老师、机构、课程"
							]
						]
					]
				]
			],
			[
				"band",
				{
					"theme": "level1",
					"style": "height:100rem;margin-top:10rem;padding:10rem 20rem;"
				},
				[
					[
						"band",
						null,
						[
							[
								"icon",
								{
									"icon": "home-hot"
								}
							],
							[
								"text",
								null,
								"热门课程"
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
					],
					[
						"band",
						{
							"key": "hot"
						}
					]
				]
			],
			[
				"band",
				{
					"theme": "level1",
					"style": "height:100rem;margin-top:10rem;padding:10rem 20rem;"
				},
				[
					[
						"band",
						null,
						[
							[
								"icon",
								{
									"icon": "home-hot"
								}
							],
							[
								"text",
								null,
								"直播课程"
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
					],
					[
						"band",
						{
							"key": "hot"
						}
					]
				]
			],
			[
				"band",
				{
					"theme": "level1",
					"style": "height:100rem;margin-top:10rem;padding:10rem 20rem;"
				},
				[
					require("./box-title.html").apply({ icon: 'home-hot', text: '热门课程' }, [1, 2]),
					[
						require("./test"),
						{
							"style": "color:red;"
						}
					],
					[
						"band",
						{
							"key": "hot"
						}
					]
				]
			],
			[
				"band",
				{
					"style": "margin-top:10rem;"
				},
				[
					[
						"button",
						{
							"events": {
								"tap": this.openTest
							}
						},
						"Open Test"
					]
				]
			]
		]
	]
)


}