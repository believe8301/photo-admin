'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let res = {}
	switch (event.type) {
		case 'mpweixinGet':
			res = await uniCloud
				.database()
				.collection('code-mag')
				// ,state: true
				.where({
					is_del: false
				})
				.get()
			if (res && res.data) {
				res.data.forEach(el => {
					el.imageUrl = el.image_url
					delete el.image_url
					return el
				});
			}
			break;
	}

	//返回数据给客户端
	return res
};
