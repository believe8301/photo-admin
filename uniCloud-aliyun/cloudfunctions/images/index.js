'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let res = {};
	switch (event.type) {
		case 'mpweixin':
			res = await uniCloud
				.database()
				.collection('images')
				.orderBy("sort", "asc")
				.where({
					is_del: false,
					state: true,
					category_id: event.categoryId
				})
				.get()
			break;
		case 'imageUsed':
			if (event.imageInfo && event.imageInfo._id) {
				let params = {
					...event.imageInfo
				};
				delete params._id
				params.total_sell_count += 1
				res = await uniCloud
					.database()
					.collection('images').doc(event.imageInfo._id).update(params)
			}

			break;
	}
	//返回数据给客户端
	return res
};
