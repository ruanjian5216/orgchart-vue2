<template>
  <!-- 根节点需要容器包裹 -->
  <div v-if="isRoot" class="org-tree-container" :style="{ '--line-width': lineWidth, '--line-color': lineColor }">
    <div class="org-tree">
      <div class="org-tree-node" :class="{ 'is-leaf': isLeaf }">
        <!-- 节点标签区域 -->
        <div class="org-tree-node-label">
           <slot :node="node">
          <div class="org-tree-node-label-inner">
            {{ node.name }}
          </div>
        </slot>
        </div>
        <!-- 子节点容器 -->
        <div v-if="node.children && node.children.length > 0" class="org-tree-node-children">
          <!-- 递归渲染子节点 -->
          <OrgNode v-for="(child, i) in node.children" :key="i" :node="child" :is-root="false"
            :borderColor="borderColor" :lineColor="lineColor" :lineWidth="lineWidth" :hideBorder="hideBorder">
            <!-- 传递插槽内容到子节点 -->
            <template #default="slotProps">
              <slot :node="slotProps.node"></slot>
            </template>
          </OrgNode>
        </div>
      </div>
    </div>
  </div>
  <!-- 非根节点直接渲染 -->
  <div v-else class="org-tree-node" :class="{ 'is-leaf': isLeaf }"
    :style="{ '--line-width': lineWidth, '--line-color': lineColor }">
    <!-- 节点标签区域 -->
    <div class="org-tree-node-label">
      <div :style="{ border: hideBorder ? 'none' : '1px solid ' + borderColor }">
        <slot :node="node">
          <div class="org-tree-node-label-inner">
            {{ node.name }}
          </div>
        </slot>
      </div>
    </div>
    <!-- 子节点容器 -->
    <div v-if="node.children && node.children.length > 0" class="org-tree-node-children">
      <!-- 递归渲染子节点 -->
      <OrgNode v-for="(child, i) in node.children" :key="i" :node="child" :is-root="false" :borderColor="borderColor"
        :lineColor="lineColor" :lineWidth="lineWidth" :hideBorder="hideBorder">
        <!-- 传递插槽内容到子节点 -->
        <template #default="slotProps">
          <slot :node="slotProps.node"></slot>
        </template>
      </OrgNode>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrgNode',
  props: {
    node: Object,
    isRoot: {
      type: Boolean,
      default: true
    },
    borderColor: {
      type: String,
      default: '#ddd'
    },
    lineColor: {
      type: String,
      default: '#ddd'
    },
    lineWidth: {
      type: String,
      default: '1px'
    },
    hideBorder: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 计算是否为叶子节点
    isLeaf() {
      return !(Array.isArray(this.node.children) && this.node.children.length > 0);
    }
  }
};
</script>

<style lang="scss">
/* 组织架构树容器 */
.org-tree-container {
  display: inline-block;
  padding: 15px;
  background-color: #fff;
}

.org-tree {
  display: table;
  text-align: center;
}

.org-tree:before,
.org-tree:after {
  content: '';
  display: table;
}

.org-tree:after {
  clear: both;
}

.org-tree-node,
.org-tree-node-children {
  position: relative;
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.org-tree-node:before,
.org-tree-node:after,
.org-tree-node-children:before,
.org-tree-node-children:after {
  transition: all .35s;
}

/* 节点标签样式 */
.org-tree-node-label {
  position: relative;
  display: inline-block;
}

.org-tree-node-label-inner {
  text-align: center;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  padding: 10px 15px;
}

.org-tree-node-label-inner:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* 节点布局 */
.org-tree-node {
  padding-top: 20px;
  display: table-cell;
  vertical-align: top;
}

.org-tree-node.is-leaf {
  padding-left: 10px;
  padding-right: 10px;
}

/* 连接线样式 - 水平线 */
.org-tree-node:before,
.org-tree-node:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 19px;
}

.org-tree-node:after {
  left: 50%;
  /* Vue2中需要通过动态绑定实现: border-left: lineWidth solid lineColor; */
  border-left: var(--line-width, 1px) solid var(--line-color, #ddd);
}

.org-tree-node:not(:first-child):before,
.org-tree-node:not(:last-child):after {
  /* Vue2中需要通过动态绑定实现: border-top: lineWidth solid lineColor; */
  border-top: var(--line-width, 1px) solid var(--line-color, #ddd);
}

/* 根节点特殊处理 */
.org-tree>.org-tree-node {
  padding-top: 0;
}

.org-tree>.org-tree-node:after {
  border-left: 0;
}

/* 子节点容器 */
.org-tree-node-children {
  padding-top: 20px;
  display: table;
}

/* 垂直连接线 */
.org-tree-node-children:before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 20px;
  /* Vue2中需要通过动态绑定实现: border-left: lineWidth solid lineColor; */
  border-left: var(--line-width, 1px) solid var(--line-color, #ddd);
}

.org-tree-node-children:after {
  content: '';
  display: table;
  clear: both;
}
</style>