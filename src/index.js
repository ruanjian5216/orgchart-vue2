// 导入组件
import OrgChart from './OrgChart.vue'
import OrgNode from './OrgNode.vue'

// 导出组件
export { OrgChart, OrgNode }

export default {
  install: (Vue) => {
    Vue.component('OrgChart', OrgChart)
    Vue.component('OrgNode', OrgNode)
  }
}