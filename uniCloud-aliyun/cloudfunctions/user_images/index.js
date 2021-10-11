'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let res = {};
	switch (event.type) {
		case 'getUserImagesByOpenId':
			res = await uniCloud
				.database()
				.collection('user_images')
				.where({user_id: event.useId})
				.get()
			break;
	}
	//返回数据给客户端
	return res
};
