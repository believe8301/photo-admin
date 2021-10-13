'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	let res = {}
	switch (event.type) {
		case 'mpweixinGet':
			res = await uniCloud
				.database()
				.collection('code-mag')
				.where({is_del: false,state: true})
				.get();
			break;
	}
	
	//返回数据给客户端
	return res
};
