<template>
	<view class="uni-container">
		<uni-forms ref="form" :value="formData" validateTrigger="bind">
			<uni-forms-item name="category_id" label="分类">
				<uni-data-picker :multiple="false" v-model="formData.category_id" :localdata="categoryList"></uni-data-picker>
			</uni-forms-item>
			<uni-forms-item name="image_url" label="图片">
				<view style="display: flex;align-items: center;">
					<image :src="formData.image_url" v-if="formData.image_url" style="width: 150rpx;margin-right: 20rpx;" mode="widthFix"></image>
					<button type="primary" class="uni-button" style="width: 100px;" @click="uploadImage()">选择图片</button>
				</view>
			</uni-forms-item>
			<uni-forms-item name="sort" label="排序">
				<uni-easyinput placeholder="排序，越大越靠后" type="number" v-model="formData.sort"></uni-easyinput>
			</uni-forms-item>
			<uni-forms-item name="state" label="是否启用">
				<uni-data-checkbox :multiple="false" v-model="formData.state" :localdata="formOptions.state_localdata"></uni-data-checkbox>
			</uni-forms-item>
			<view class="uni-button-group">
				<button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;"><button class="uni-button" style="width: 100px;">返回</button></navigator>
			</view>
		</uni-forms>
	</view>
</template>

<script>
import { validator } from '../../../js_sdk/validator/images.js';

const db = uniCloud.database();
const dbCmd = db.command;
const dbCollectionName = 'images';

function getValidator(fields) {
	let result = {};
	for (let key in validator) {
		if (fields.includes(key)) {
			result[key] = validator[key];
		}
	}
	return result;
}

export default {
	data() {
		let formData = {
			category_id: '',
			image_url: '',
			state: true,
			is_del: false,
			sort: null,
			last_modify_date: new Date()
		};
		return {
			formData,
			categoryList: [],
			formOptions: {
				state_localdata: [
					{
						text: '启用',
						value: true
					},
					{
						text: '禁用',
						value: false
					}
				]
			},
			rules: {
				...getValidator(Object.keys(formData))
			}
		};
	},
	onLoad(e) {
		this.getCategory();
		if (e.id) {
			const id = e.id;
			this.formDataId = id;
			this.getDetail(id);
		}
	},
	onReady() {
		this.$refs.form.setRules(this.rules);
	},
	methods: {
		uploadImage() {
			if (!this.formData.category_id) {
				uni.showToast({
					title: '请先选择分类',
					icon: 'none'
				});
				return;
			}
			uni.chooseImage({
				count: 1, //默认9
				sizeType: ['original'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album'], //从相册选择
				success: res => {
					let filePath = res.tempFilePaths[0];
					const result = uniCloud.uploadFile({
						filePath: filePath,
						cloudPath: `${this.formData.category_id}-${new Date().getTime()}.png`
					});
					result.then(res => {
						//获取到上传到云储存的url地址
						this.formData.image_url = res['fileID'];
					});
				}
			});
		},
		/**
		 * 触发表单提交
		 */
		submit() {
			uni.showLoading({
				mask: true
			});
			this.$refs.form
				.validate()
				.then(res => {
					this.submitForm(res);
				})
				.catch(() => {
					uni.hideLoading();
				});
		},

		submitForm(value) {
			// 使用 clientDB 提交数据
			db.collection(dbCollectionName)
				.doc(this.formDataId)
				.update(value)
				.then(res => {
					uni.showToast({
						title: '修改成功'
					});
					this.getOpenerEventChannel().emit('refreshData');
					setTimeout(() => uni.navigateBack(), 500);
				})
				.catch(err => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					});
				})
				.finally(() => {
					uni.hideLoading();
				});
		},
		/**
		 * 获取分类数据
		 */
		getCategory() {
			uni.showLoading({
				mask: true
			});
			uniCloud
				.database()
				.collection('categories')
				.orderBy("sort asc")
				.where('is_del==false&&state==true')
				.field('name as text,_id as value')
				.get()
				.then(res => {
					const data = res.result.data;
					if (data) {
						this.categoryList = data;
					}
				})
				.catch(err => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					});
				})
				.finally(() => {
					uni.hideLoading();
				});
		},

		/**
		 * 获取表单数据
		 * @param {Object} id
		 */
		getDetail(id) {
			uni.showLoading({
				mask: true
			});
			db.collection(dbCollectionName)
				.doc(id)
				.field('category_id,sort,image_url,month_sell_count,total_sell_count,state,is_del,add_date,last_modify_date')
				.get()
				.then(res => {
					const data = res.result.data[0];
					if (data) {
						this.formData = data;
					}
				})
				.catch(err => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					});
				})
				.finally(() => {
					uni.hideLoading();
				});
		}
	}
};
</script>
