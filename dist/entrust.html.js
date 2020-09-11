module.exports = function (data) {


return {
	"Class": "Page",
	"style": "height:100%;position: relative",
	"children": [
		{
			"Class": "Header",
			"content": [
				{
					"Class": "BackButton"
				},
				{
					"Class": "Panel",
					"key": "entrustTitle",
					"style": "text-align: center;width: 100%",
					"children": [
						{
							"Class": "Text",
							"text": '当前委托',
							"theme": "primary",
							"style": "padding-right: .2rem",
							"events": {
								"tap": data.tapCurr
							}
						},
						{
							"Class": "Text",
							"text": '历史委托',
							"events": {
								"tap": data.tapHis
							}
						}
					]
				}
			]
		},
		{
			"Class": require("./test")
		},
		{
			"Class": "Content",
			"style": "position: absolute;top:.5rem;bottom:0;",
			"children": [
				{
					"Class": "Panel",
					"layout": "same-width",
					"style": "position: absolute;top:0;width:100%;z-index:1;",
					"children": [
						{
							"Class": "Panel",
							"style": "position: relative;padding-right: .01rem;",
							"children": [
								{
									"Class": "Panel",
									"layout": "line-middle",
									"style": "text-align: center",
									"events": {
										"tap": data.tapCoinPairs
									},
									"children": [
										{
											"Class": "Text",
											"key": "coinsTitle",
											"text": type
										},
										{
											"Class": "Icon",
											"svg": "icon-exchange-otc-zhankai",
											"style": "font-size: .12rem;padding-left: .05rem"
										}
									]
								},
								{
									"Class": "Panel",
									"key": "coins"
								},
								{
									"Class": "Panel",
									"key": "coinDetails",
									"style": "position: absolute;width: 1.9rem;right: -1.9rem;top: .5rem"
								}
							]
						},
						{
							"Class": "Panel",
							"style": "float: right;position: relative",
							"children": [
								{
									"Class": "Panel",
									"layout": "line-middle",
									"style": "text-align: center",
									"events": {
										"tap": data.tapTransType
									},
									"children": [
										{
											"Class": "Text",
											"key": "typesTitle",
											"text": '全部',
											"style": "color: @font-level3-color;"
										},
										{
											"Class": "Icon",
											"svg": "icon-exchange-otc-zhankai",
											"style": "color: @font-level3-color; font-size: .12rem;padding-left: .05rem"
										}
									]
								},
								{
									"Class": "Panel",
									"key": "types",
									"style": "display: none;background: #ffecec",
									"children": [
										{
											"Class": "Text",
											"text": '全部',
											"style": "display: block;text-align: center;padding: .05rem 0",
											"events": {
												"tap": data.tapTypeDetails
											}
										},
										{
											"Class": "Text",
											"text": '买入',
											"style": "display: block;text-align: center;padding: .05rem 0",
											"events": {
												"tap": data.tapTypeDetails
											}
										},
										{
											"Class": "Text",
											"text": '卖出',
											"style": "display: block;text-align: center;padding: .05rem 0",
											"events": {
												"tap": data.tapTypeDetails
											}
										}
									]
								}
							]
						}
					]
				},
				{
					"Class": "R",
					"src": "entrust-list.js",
					"key": "entrustList",
					"coinPairCode": type,
					"style": "height: 100%;margin-top: .5rem"
				}
			]
		}
	]
};


}