'use strict';
const db = uniCloud.database()
const intervalTime = 7 * 24 * 60 * 60 * 1000
exports.main = async (event, context) => {
	let res = {}

	function getRandom(max) {
		return Math.round(Math.random() * max)
	}

	function getDefauteSign(userSign) {
		return new Promise(async (reslove) => {
			let categoryInfo = await getRandomCategory('getCategoryById', userSign[0].category_id)
			let contentInfo = await getRandomContent('getContentById', '', userSign[0].content_id)
			if (categoryInfo && contentInfo) {
				reslove({
					name: categoryInfo.name,
					content: contentInfo.content,
				})
			}
			reslove(false)
		})
	}

	function getRandomCategory(type, id) {
		return new Promise(async (reslove) => {
			let params = {
				is_del: false,
				state: true
			}
			if (id) {
				params._id = id
			}
			let categoryList = await db.collection('sign-category')
				.where(params).get();
			categoryList = categoryList.data
			let categoryIndex = 0
			if (type === 'random') {
				categoryIndex = getRandom(categoryList.length - 1)
			}
			reslove(categoryList[categoryIndex])
		})
	}

	function getRandomContent(type, categoryId, id) {
		return new Promise(async (reslove) => {
			let params = {
				is_del: false,
				state: true
			}
			if (id) {
				params._id = id
			}
			if (categoryId) {
				params.category_id = categoryId
			}
			let signList = await db.collection('sign-content')
				.where(params).get();
			signList = signList.data
			let signIndex = 0
			if (type === 'random') {
				signIndex = getRandom(signList.length - 1)
			}
			reslove(signList[signIndex])
		})
	}

	function addUserSign(params) {
		return db.collection('user_sign').add({
			user_id: event.userId,
			create_date: Date.now(),
			update_date: Date.now(),
			...params
		});
	}

	function updateUserSign(params) {
		return db.collection('user_sign').where({
			user_id: event.userId
		}).update({
			update_date: Date.now(),
			...params
		});
	}
	switch (event.type) {
		case 'drawLots':
			let userSign = await db.collection('user_sign').where({
				user_id: event.userId
			}).get();
			userSign = userSign.data
			let currentDate = Date.now()
			if (userSign && userSign.length > 0 && currentDate - userSign[0].update_date < intervalTime) {
				res = await getDefauteSign(userSign)
				if (!res) {
					let selectCategory = await getRandomCategory('random')
					let selectSign = await getRandomContent('random', selectCategory._id)
					await updateUserSign({
						category_id: selectCategory._id,
						content_id: selectSign._id
					});
					res = {
						name: selectCategory.name,
						content: selectSign.content,
					}
				}
			} else {
				let selectCategory = await getRandomCategory('random')
				let selectSign = await getRandomContent('random', selectCategory._id)
				res = {
					name: selectCategory.name,
					content: selectSign.content,
				}
				if (userSign && userSign.length > 0) {
					await updateUserSign({
						category_id: selectCategory._id,
						content_id: selectSign._id
					});
				} else {
					await addUserSign({
						category_id: selectCategory._id,
						content_id: selectSign._id
					});

				}
			}
			break;
	}
	//返回数据给客户端
	return res
};
