<template>
  <view class="uni-container">
    <uni-forms ref="form" :value="formData" validateTrigger="bind">
      <uni-forms-item name="sign_category_sn" label="编号">
        <uni-easyinput placeholder="签类别的唯一编号" v-model="formData.sign_category_sn" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="name" label="类别" required>
        <uni-easyinput placeholder="名称" v-model="formData.name" trim="both"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item name="state" label="是否启用" required>
        <uni-data-checkbox v-model="formData.state" :localdata="formOptions.state_localdata"></uni-data-checkbox>
      </uni-forms-item>
     <!-- <uni-forms-item name="is_del" label="是否删除" required>
        <uni-data-checkbox v-model="formData.is_del" :localdata="formOptions.is_del_localdata"></uni-data-checkbox>
      </uni-forms-item> -->
      <uni-forms-item name="sort" label="排序">
        <uni-easyinput placeholder="排序，越大越靠后" type="number" v-model="formData.sort"></uni-easyinput>
      </uni-forms-item>
     <!-- <uni-forms-item name="add_date" label="创建时间" required>
        <uni-datetime-picker return-type="timestamp" v-model="formData.add_date"></uni-datetime-picker>
      </uni-forms-item>
      <uni-forms-item name="last_modify_date" label="最后修改时间" required>
        <uni-datetime-picker return-type="timestamp" v-model="formData.last_modify_date"></uni-datetime-picker>
      </uni-forms-item> -->
      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
          <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../../js_sdk/validator/sign-category.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'sign-category';

  function getValidator(fields) {
    let result = {}
    for (let key in validator) {
      if (fields.includes(key)) {
        result[key] = validator[key]
      }
    }
    return result
  }

  export default {
    data() {
      let formData = {
        "sign_category_sn": "",
        "name": "",
        "state": true,
        "is_del": false,
        "sort": null,
        "add_date": null,
        "last_modify_date": null
      }
      return {
        formData,
        formOptions: {
          "state_localdata": [
            {
              "text": "启用",
              "value": true
            },
            {
              "text": "禁用",
              "value": false
            }
          ],
          "is_del_localdata": [
            {
              "text": "是",
              "value": true
            },
            {
              "text": "否",
              "value": false
            }
          ]
        },
        rules: {
          ...getValidator(Object.keys(formData))
        }
      }
    },
    onReady() {
		console.log(this.rules)
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      /**
       * 验证表单并提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.validate().then((res) => {
          return this.submitForm(res)
        }).catch(() => {
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 提交表单
       */
      submitForm(value) {
        // 使用 clientDB 提交数据
        return db.collection(dbCollectionName).add(value).then((res) => {
          uni.showToast({
            title: '新增成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        })
      }
    }
  }
</script>
