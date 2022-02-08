<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title"></view>
				<view class="uni-sub-title"></view>
			</view>
			<view class="uni-group">
				<button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
				<!--        <button class="uni-button" type="default" size="mini" :disabled="!selectedIndexs.length" @click="delTable">批量删除</button>
 -->
				<download-excel class="hide-on-phone" :fields="exportExcel.fields" :data="exportExcelData" :type="exportExcel.type" :name="exportExcel.filename">
					<button class="uni-button" type="primary" size="mini">导出 Excel</button>
				</download-excel>
			</view>
		</view>
		<view class="uni-container">
			<unicloud-db
				ref="udb"
				:collection="collectionList"
				field="sign_category_sn,name,state,is_del,sort,add_date,last_modify_date"
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
					<uni-tr>
						<uni-th align="center">序号</uni-th>
						<uni-th
							align="center"
							filter-type="search"
							@filter-change="filterChange($event, 'sign_category_sn')"
							sortable
							@sort-change="sortChange($event, 'sign_category_sn')"
						>
							编号
						</uni-th>
						<uni-th align="center" filter-type="search" @filter-change="filterChange($event, 'name')" sortable @sort-change="sortChange($event, 'name')">类别</uni-th>
						<uni-th align="center" filter-type="select" :filter-data="options.filterData.state_localdata" @filter-change="filterChange($event, 'state')">
							是否启用
						</uni-th>
						<!-- <uni-th align="center" filter-type="select" :filter-data="options.filterData.is_del_localdata" @filter-change="filterChange($event, 'is_del')">是否删除</uni-th> -->
						<uni-th align="center" sortable @sort-change="sortChange($event, 'sort')">排序</uni-th>
						<uni-th align="center" filter-type="timestamp" @filter-change="filterChange($event, 'add_date')" sortable @sort-change="sortChange($event, 'add_date')">
							创建时间
						</uni-th>
						<uni-th
							align="center"
							filter-type="timestamp"
							@filter-change="filterChange($event, 'last_modify_date')"
							sortable
							@sort-change="sortChange($event, 'last_modify_date')"
						>
							最后修改时间
						</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item, index) in data" :key="index">
						<uni-td align="center">{{ index + 1 }}</uni-td>
						<uni-td align="center">{{ item.sign_category_sn }}</uni-td>
						<uni-td align="center">{{ item.name }}</uni-td>
						<uni-td align="center">{{ getStateText(item.state) }}</uni-td>
						<uni-td align="center">{{ item.sort }}</uni-td>
						<uni-td align="center"><uni-dateformat :threshold="[0, 0]" :date="item.add_date"></uni-dateformat></uni-td>
						<uni-td align="center"><uni-dateformat :threshold="[0, 0]" :date="item.last_modify_date"></uni-dateformat></uni-td>
						<uni-td align="center">
							<view class="uni-group">
								<button @click="navigateTo('./edit?id=' + item._id, false)" class="uni-button" size="mini" type="primary">修改</button>
								<button @click="confirmDelete(item, { state: false })" v-if="item.state" class="uni-button" size="mini" type="warn">禁用</button>
								<template v-else>
									<button @click="confirmDelete(item, { state: true })" class="uni-button" size="mini" type="primary">启用</button>
									<button @click="confirmDelete(item, { is_del: true })" class="uni-button" size="mini" type="warn">删除</button>
								</template>
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
import { enumConverter, filterToWhere } from '../../../js_sdk/validator/sign-category.js';

const db = uniCloud.database();
// 表查询配置
const dbOrderBy = ''; // 排序字段
const dbSearchFields = []; // 模糊搜索字段，支持模糊搜索的字段列表。联表查询格式: 主表字段名.副表字段名，例如用户表关联角色表 role.role_name
// 分页配置
const pageSize = 20;
const pageCurrent = 1;

const orderByMapping = {
	ascending: 'asc',
	descending: 'desc'
};
const filterInfo = 'is_del == false';

export default {
	data() {
		return {
			collectionList: 'sign-category',
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
				...enumConverter
			},
			imageStyles: {
				width: 64,
				height: 64
			},
			exportExcel: {
				filename: 'sign-category.xls',
				type: 'xls',
				fields: {
					编号: 'sign_category_sn',
					类别: 'name',
					是否启用: 'state',
					是否删除: 'is_del',
					排序: 'sort',
					创建时间: 'add_date',
					最后修改时间: 'last_modify_date'
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
		getStateText(val) {
			return this.options.filterData.state_localdata.find(el => el.value === val).text;
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
		confirmDelete(item, val) {
			let msg = '';
			if (val.is_del) {
				msg = '删除';
			} else if (val.state) {
				msg = '启用';
			} else if (val.hasOwnProperty('state')) {
				msg = '停用';
			}
			uni.showModal({
				title: '提示',
				content: `是否确认${msg}${item.name}`,
				success: res => {
					if (res.confirm) {
						this.$refs.udb.update(item._id, val, {
							success: res => {
								uni.showToast({
									content: `${msg}成功`
								});
								this.$nextTick(() => {
									this.$refs.udb.loadData();
								});
								this.$refs.table.clearSelection();
							}
						});
					}
				}
			});
		},
		sortChange(e, name) {
			this.orderByFieldName = name;
			if (e.order) {
				this.orderby = name + ' ' + orderByMapping[e.order];
			} else {
				this.orderby = '';
			}
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
