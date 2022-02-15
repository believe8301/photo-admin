'use strict';
exports.main = async (event, context) => {
	let res = {}
	function getRandom(max) {
		return Math.round(Math.random() * max)
	}
	switch (event.type) {
		case 'drawLots':
			let categoryList = await uniCloud
				.database()
				.collection('sign-category')
				.where({is_del: false,state: true})
				.get();
			let categoryIndex = getRandom(categoryList.length -1)
			let selectCategory = categoryList[categoryIndex]
			let signList = await uniCloud
				.database()
				.collection('sign-content')
				.where({is_del: false,state: true,category_id: selectCategory._id})
				.get();
			let signIndex = getRandom(signList.length -1)
			let selectSign = signList[signIndex]
			res = {
				name: selectCategory.name,
				content: selectCategory.content,
			}
			break;
	}
	//返回数据给客户端
	return res
};
