'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let res = {};
	switch (event.type) {
		case 'mpweixin':
			res = await uniCloud
				.database()
				.collection('images')
				.where({is_del: false,state: true,category_id: event.categoryId})
				.get()
			break;
	}
	//返回数据给客户端
	return res
};
