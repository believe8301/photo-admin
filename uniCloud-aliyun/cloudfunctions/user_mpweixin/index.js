'use strict';
let uniID = require('uni-id')
const db = uniCloud.database()
const usersDB = db.collection('users_mpweixin')
exports.main = async (event, context) => {
	uniID = uniID.createInstance({
		context
	})
	let js_code = event.code
	const appid = 'wx677cdf0c74ecfebf' //appid  
	const secret = '05893277bb68c171aa560ada3f1dc293' //secret  
	const loginUrl = 'https://api.weixin.qq.com/sns/jscode2session'

	let res = {}
	let params = {}
	console.log(event.userId)
	if (!event.userId) {
		res = await uniCloud.httpclient.request(loginUrl, {
			data: {
				appid: appid,
				secret: secret,
				js_code: js_code,
				grant_type: 'authorization_code'
			},
			dataType: 'json'
		});
		let dbCmd = db.collection('users_mpweixin').where({
			open_id: res.data.openid
		})
		const userInfo = await dbCmd.get();
		params = {
			...userInfo.data[0]
		}
	}

	switch (event.type) {
		case 'userLogin':
			if (!(params && params._id)) {
				params = {
					open_id: res.data.openid,
					nickName: event.nickName,
					create_date: Date.now()
				}
				let addUser = await db.collection('users_mpweixin').add(params);
				params._id = addUser.id;
			}
			break;
		case 'createImages':
			if (params && params._id) {
				let imagesList = await db.collection('user_images').where({
					user_id: params._id,
					image_url: event.avatarImage
				}).get();
				let imagesInfo = imagesList.data[0]
				if (imagesInfo && imagesInfo._id) {
					delete imagesInfo._id
					imagesInfo.update_date = Date.now()
					await db.collection('user_images').where({
						user_id: params._id,
						image_url: event.avatarImage
					}).update(imagesInfo);
				} else {
					await db.collection('user_images').add({
						user_id: params._id,
						image_url: event.avatarImage,
						create_date: Date.now(),
						update_date: Date.now()
					});
				}
			} else {
				params = {
					open_id: res.data.openid,
					nickName: event.nickName,
					create_date: Date.now()
				}
				let addUser = await db.collection('users_mpweixin').add(params);
				params._id = addUser.id;
				await db.collection('user_images').add({
					user_id: addUser.id,
					image_url: event.avatarImage,
					create_date: Date.now(),
					update_date: Date.now()
				});
			}
			break;
		case 'selectedImage':
			await db.collection('user_images').add({
				user_id: event.userId,
				image_url: event.avatarImage,
				create_date: Date.now(),
				update_date: Date.now()
			});
			params = true

	}

	return params
};
