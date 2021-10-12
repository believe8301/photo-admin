// 表单校验规则由 schema2code 生成，不建议直接修改校验规则，而建议通过 schema2code 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema


const validator = {
  "category_id": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      }
    ],
    "label": "分类"
  },
  "image_url": {
    "rules": [
      {
        "required": true
      },
      {
        "format": "string"
      },
      {
        "pattern": "^(http://|https://|/|./|@/)\\S"
      }
    ],
    "label": "图片地址"
  },
  "month_sell_count": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "defaultValue": 0,
    "label": "月下载次数"
  },
  "total_sell_count": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "defaultValue": 0,
    "label": "总下载次数"
  },
  "state": {
    "rules": [
      {
        "format": "bool"
      },
      {
        "range": [
          {
            "text": "启用",
            "value": true
          },
          {
            "text": "禁用",
            "value": false
          }
        ]
      }
    ],
    "defaultValue": true,
    "label": "是否启用"
  },
  "is_del": {
    "rules": [
      {
        "format": "bool"
      },
      {
        "range": [
          {
            "text": "是",
            "value": true
          },
          {
            "text": "否",
            "value": false
          }
        ]
      }
    ],
    "defaultValue": false,
    "label": "是否删除"
  },
  "sort": {
    "rules": [
      {
        "format": "int"
      }
    ],
    "label": "排序"
  },
  "add_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ],
    "defaultValue": {
      "$env": "now"
    },
    "label": "创建时间"
  },
  "last_modify_date": {
    "rules": [
      {
        "format": "timestamp"
      }
    ],
    "defaultValue": {
      "$env": "now"
    },
    "label": "最后修改时间"
  }
}

const enumConverter = {
  "state_valuetotext": [
    {
      "text": "启用",
      "value": true
    },
    {
      "text": "禁用",
      "value": false
    }
  ],
  "is_del_valuetotext": [
    {
      "text": "是",
      "value": true
    },
    {
      "text": "否",
      "value": false
    }
  ]
}

function filterToWhere(filter, command) {
  let where = {}
  for (let field in filter) {
    let { type, value } = filter[field]
    switch (type) {
      case "search":
        if (typeof value === 'string' && value.length) {
          where[field] = new RegExp(value)
        }
        break;
      case "select":
        if (value.length) {
          let selectValue = []
          for (let s of value) {
            selectValue.push(command.eq(s))
          }
          where[field] = command.or(selectValue)
        }
        break;
      case "range":
        if (value.length) {
          let gt = value[0]
          let lt = value[1]
          where[field] = command.and([command.gte(gt), command.lte(lt)])
        }
        break;
      case "date":
        if (value.length) {
          let [s, e] = value
          let startDate = new Date(s)
          let endDate = new Date(e)
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
      case "timestamp":
        if (value.length) {
          let [startDate, endDate] = value
          where[field] = command.and([command.gte(startDate), command.lte(endDate)])
        }
        break;
    }
  }
  return where
}

export { validator, enumConverter, filterToWhere }
