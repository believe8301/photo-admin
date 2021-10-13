<template>
	<view class="uni-container">
		<uni-forms ref="form" :value="formData" validateTrigger="bind">
			<uni-forms-item name="type" label="类型"><uni-easyinput placeholder="类型" v-model="formData.type"></uni-easyinput></uni-forms-item>
			<uni-forms-item name="code" label="标识"><uni-easyinput placeholder="唯一标识" v-model="formData.code"></uni-easyinput></uni-forms-item>
			<uni-forms-item name="title" label="标题"><uni-easyinput placeholder="标题" v-model="formData.title"></uni-easyinput></uni-forms-item>
			<uni-forms-item name="desc" label="描述"><uni-easyinput placeholder="描述" v-model="formData.desc"></uni-easyinput></uni-forms-item>
			<uni-forms-item name="image_url" label="图片">
				<view style="display: flex;align-items: center;">
					<image :src="formData.image_url" v-if="formData.image_url" style="width: 150rpx;margin-right: 20rpx;" mode="widthFix"></image>
					<button type="primary" class="uni-button" style="width: 100px;" @click="uploadImage()">选择图片</button>
				</view>
			</uni-forms-item>
			<uni-forms-item name="path" label="路由"><uni-easyinput placeholder="路由" v-model="formData.path"></uni-easyinput></uni-forms-item>
			<uni-forms-item name="state" label="状态"><uni-data-checkbox v-model="formData.state" :localdata="formOptions.state_localdata"></uni-data-checkbox></uni-forms-item>
			<view class="uni-button-group">
				<button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
				<navigator open-type="navigateBack" style="margin-left: 15px;"><button class="uni-button" style="width: 100px;">返回</button></navigator>
			</view>
		</uni-forms>
	</view>
</template>

<script>
import { validator } from '../../../js_sdk/validator/code-mag.js';

const db = uniCloud.database();
const dbCmd = db.command;
const dbCollectionName = 'code-mag';

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
			type: '',
			code: '',
			title: '',
			desc: '',
			image_url: '',
			path: '',
			state: true,
			is_del: false,
			update_date: new Date().getTime()
		};
		return {
			formData,
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
				],
				is_del_localdata: [
					{
						text: '是',
						value: true
					},
					{
						text: '否',
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
			if (!this.formData.code) {
				uni.showToast({
					title: '请先输入标识',
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
						cloudPath: `${this.formData.code}-${new Date().getTime()}.png`
					});
					result.then(res => {
						//获取到上传到云储存的url地址
						this.formData.image_url = res['fileID'];
					});
				}
			});
		},
		/**
		 * 验证表单并提交
		 */
		submit() {
			uni.showLoading({
				mask: true
			});
			this.$refs.form
				.validate()
				.then(res => {
					return this.submitForm(res);
				})
				.catch(() => {})
				.finally(() => {
					uni.hideLoading();
				});
		},

		/**
		 * 提交表单
		 */
		submitForm(value) {
			// 使用 clientDB 提交数据
			value = { ...value, update_date: new Date().getTime() };
			return db
				.collection(dbCollectionName)
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
				.field('type,code,title,desc,image_url,path,state,create_date,update_date')
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
