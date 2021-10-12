<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title"></view>
				<view class="uni-sub-title"></view>
			</view>
			<view class="uni-group">
				<button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
				<!-- <button class="uni-button" type="default" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button> -->
				<download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
					<button class="uni-button" type="primary" size="mini">导出 Excel</button>
				</download-excel>
			</view>
		</view>
		<view class="uni-container">
			<unicloud-db
				ref="udb"
				collection="images,categories"
				field="category_id{name},image_url,month_sell_count,total_sell_count,state,is_del,sort,add_date,last_modify_date"
				:where="where"
				page-data="replace"
				:orderby="orderby"
				:getcount="true"
				:page-size="options.pageSize"
				:page-current="options.pageCurrent"
				v-slot:default="{ data, pagination, loading, error, options }"
				:options="options"
				loadtime="manual"
				@load="onqueryload"
			>
				<uni-table ref="table" :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe>
					<!-- type="selection" @selection-change="selectionChange" -->
					<uni-tr>
						<uni-th align="center">分类</uni-th>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'image_url')" sortable @sort-change="sortChange($event, 'image_url')">
							图片地址
						</uni-th>
						<uni-th
							align="center"
							sortable
							@sort-change="sortChange($event, 'month_sell_count')"
						>
							月下载次数
						</uni-th>
						<uni-th
							align="center"
							sortable
							@sort-change="sortChange($event, 'total_sell_count')"
						>
							总下载次数
						</uni-th>
						<uni-th align="center" filter-type="select" :filter-data="options.filterData.state_localdata" @filter-change="filterChange($event, 'state')">
							是否启用
						</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'sort')">排序</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'add_date')">创建时间</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'last_modify_date')">最后修改时间</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item, index) in data" :key="index">
						<uni-td align="center">{{ item.category_id && item.category_id[0] && item.category_id[0].name }}</uni-td>
						<uni-td align="center">
							<image :src="item.image_url" style="width: 100rpx;" mode="widthFix"></image>
						</uni-td>
						<uni-td align="center">{{ item.month_sell_count }}</uni-td>
						<uni-td align="center">{{ item.total_sell_count }}</uni-td>
						<uni-td align="center">{{ getState(item.state) }}</uni-td>
						<uni-td align="center">{{ item.sort }}</uni-td>
						<uni-td align="center"><uni-dateformat :threshold="[0, 0]" :date="item.add_date"></uni-dateformat></uni-td>
						<uni-td align="center"><uni-dateformat :threshold="[0, 0]" :date="item.last_modify_date"></uni-dateformat></uni-td>
						<uni-td align="center">
							<view class="uni-group">
								<button @click="navigateTo('./edit?id=' + item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
								<button @click="confirmDelete(item)" class="uni-button" size="mini" type="warn">删除</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current" :total="pagination.count" @change="onPageChanged" />
				</view>
			</unicloud-db>
		</view>
	</view>
</template>

<script>
import { enumConverter, filterToWhere } from '../../../js_sdk/validator/images.js';

const db = uniCloud.database();
// 表查询配置
const dbOrderBy = 'last_modify_date'; // 排序字段
const dbSearchFields = []; // 模糊搜索字段，支持模糊搜索的字段列表
// 分页配置
const pageSize = 20;
const pageCurrent = 1;

const orderByMapping = {
	ascending: 'asc',
	descending: 'desc'
};
const filterInfo = 'is_del == false'

export default {
	data() {
		return {
			query: '',
			where: filterInfo,
			orderby: dbOrderBy,
			orderByFieldName: '',
			selectedIndexs: [],
			options: {
				pageSize,
				pageCurrent,
				filterData: {
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
				...enumConverter
			},
			imageStyles: {
				width: 64,
				height: 64
			},
			exportExcel: {
				filename: 'images.xls',
				type: 'xls',
				fields: {
					'分类': 'category_id',
					'图片地址': 'image_url',
					'月下载次数': 'month_sell_count',
					'总下载次数': 'total_sell_count',
					'是否启用': 'state',
					'是否删除': 'is_del',
					'创建时间': 'add_date',
					'最后修改时间': 'last_modify_date'
				}
			},
			exportExcelData: []
		};
	},
	onLoad() {
		this._filter = {};
	},
	onReady() {
		this.$refs.udb.loadData();
	},
	methods: {
		getState(state) {
			return this.options.filterData.state_localdata.filter(el => el.value === state)[0].text;
		},
		onqueryload(data) {
			this.exportExcelData = data;
		},
		getWhere() {
			const query = this.query.trim();
			if (!query) {
				return '';
			}
			const queryRe = new RegExp(query, 'i');
			return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ');
		},
		search() {
			const newWhere = this.getWhere();
			this.where = newWhere;
			this.$nextTick(() => {
				this.loadData();
			});
		},
		loadData(clear = true) {
			this.$refs.udb.loadData({
				clear
			});
		},
		onPageChanged(e) {
			this.selectedIndexs.length = 0;
			this.$refs.table.clearSelection();
			this.$refs.udb.loadData({
				current: e.current
			});
		},
		navigateTo(url, clear) {
			// clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
			uni.navigateTo({
				url,
				events: {
					refreshData: () => {
						this.loadData(clear);
					}
				}
			});
		},
		// 多选处理
		selectedItems() {
			var dataList = this.$refs.udb.dataList;
			return this.selectedIndexs.map(i => dataList[i]._id);
		},
		// 批量删除
		delTable() {
			this.$refs.udb.remove(this.selectedItems(), {
				success: res => {
					this.$refs.table.clearSelection();
				}
			});
		},
		// 多选
		selectionChange(e) {
			this.selectedIndexs = e.detail.index;
		},
		confirmDelete(data) {
			let value = { ...data, is_del: true };
			delete value._id;
			delete value.category_id;
			
			uniCloud
				.database()
				.collection('images')
				.doc(data._id)
				.update(value)
				.then(res => {
					this.$refs.table.clearSelection();
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
		sortChange(e, name) {
			this.orderByFieldName = name;
			if (e.order) {
				this.orderby = name + ' ' + orderByMapping[e.order];
			} else {
				this.orderby = '';
			}
			this.$refs.table.clearSelection();
			this.$nextTick(() => {
				this.$refs.udb.loadData();
			});
		},
		filterChange(e, name) {
			this._filter[name] = {
				type: e.filterType,
				value: e.filter
			};
			let newWhere = filterToWhere(this._filter, db.command);
			if (Object.keys(newWhere).length) {
				this.where = newWhere;
			} else {
				this.where = filterInfo;
			}
			this.$nextTick(() => {
				this.$refs.udb.loadData();
			});
		}
	}
};
</script>

<style></style>
