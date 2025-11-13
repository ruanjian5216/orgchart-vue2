<template>
  <div class="org-chart-container">
    <div 
      class="org-chart" 
      ref="orgChartRef" 
      @wheel="handleWheel" 
      :style="{ 
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`, 
        transformOrigin: 'center' 
      }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
    >
      <!-- 使用自定义节点组件，并通过插槽实现自定义内容样式 -->
      <OrgNode :node="treeData" :lineColor="lineColor" :lineWidth="lineWidth" >
        <template #default="{ node }">
          <slot :node="node"></slot>
        </template>
      </OrgNode>
    </div>
    <div class="zoom-controls" v-if="showZoomControls">
      <button @click="zoomIn" class="zoom-btn">+</button>
      <button @click="zoomOut" class="zoom-btn">-</button>
      <button @click="resetView" class="zoom-btn">↺</button>
    </div>
  </div>
</template>

<script>
import OrgNode from "./OrgNode.vue";

export default {
  name: 'OrgChart',
  components: {
    OrgNode
  },
  props: {
    treeData: {
      type: Object,
      required: true
    },
    lineColor: {
      type: String,
      default: '#B0C7FE'
    },
    lineWidth: {
      type: String,
      default: '3px'
    },
    minScale: {
      type: Number,
      default: 0.1
    },
    maxScale: {
      type: Number,
      default: 3
    },
    scaleStep: {
      type: Number,
      default: 0.1
    },
    showZoomControls: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      scale: 1,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
      startTranslateX: 0,
      startTranslateY: 0,
      animationFrameId: null
    };
  },
  mounted() {
    // 添加全局事件监听器来阻止浏览器默认缩放
    document.addEventListener('wheel', this.preventDefaultZoom, { passive: false });
  },
  beforeDestroy() {
    // 清理事件监听器
    document.removeEventListener('wheel', this.preventDefaultZoom);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    document.removeEventListener('touchcancel', this.handleTouchEnd);
  },
  methods: {
    // 处理滚轮事件
    handleWheel(event) {
      // 检查是否按住了Ctrl键
      if (event.ctrlKey) {
        event.preventDefault();
        
        // 根据滚轮方向调整缩放比例
        const delta = event.deltaY > 0 ? -this.scaleStep : this.scaleStep;
        const newScale = this.scale + delta;
        
        // 限制缩放范围
        if (newScale >= this.minScale && newScale <= this.maxScale) {
          this.scale = newScale;
        }
      }
    },
    // 放大函数
    zoomIn() {
      const newScale = this.scale + this.scaleStep;
      if (newScale <= this.maxScale) {
        this.scale = newScale;
      }
    },
    // 缩小函数
    zoomOut() {
      const newScale = this.scale - this.scaleStep;
      if (newScale >= this.minScale) {
        this.scale = newScale;
      }
    },
    // 鼠标按下事件处理
    handleMouseDown(event) {
      // 只有在没有按住Ctrl键时才允许拖动
      if (!event.ctrlKey) {
        this.isDragging = true;
        this.startX = event.clientX;
        this.startY = event.clientY;
        this.startTranslateX = this.translateX;
        this.startTranslateY = this.translateY;
        
        // 添加拖动类以禁用过渡动画
        if (this.$refs.orgChartRef) {
          this.$refs.orgChartRef.classList.add('dragging');
        }
        
        // 添加全局事件监听器
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        
        // 阻止默认行为
        event.preventDefault();
      }
    },
    // 触摸开始事件处理
    handleTouchStart(event) {
      if (event.touches && event.touches.length === 1) {
        this.isDragging = true;
        const touch = event.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTranslateX = this.translateX;
        this.startTranslateY = this.translateY;
        if (this.$refs.orgChartRef) {
          this.$refs.orgChartRef.classList.add('dragging');
        }
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd);
        document.addEventListener('touchcancel', this.handleTouchEnd);
        event.preventDefault();
      }
    },
    // 鼠标移动事件处理
    handleMouseMove(event) {
      if (this.isDragging) {
        // 取消之前的动画帧
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
        
        // 使用requestAnimationFrame优化性能
        this.animationFrameId = requestAnimationFrame(() => {
          const dx = event.clientX - this.startX;
          const dy = event.clientY - this.startY;
          
          this.translateX = this.startTranslateX + dx;
          this.translateY = this.startTranslateY + dy;
          
          this.animationFrameId = null;
        });
      }
    },
    // 触摸移动事件处理
    handleTouchMove(event) {
      if (this.isDragging && event.touches && event.touches.length === 1) {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
        const touch = event.touches[0];
        this.animationFrameId = requestAnimationFrame(() => {
          const dx = touch.clientX - this.startX;
          const dy = touch.clientY - this.startY;
          this.translateX = this.startTranslateX + dx;
          this.translateY = this.startTranslateY + dy;
          this.animationFrameId = null;
        });
        event.preventDefault();
      }
    },
    // 鼠标释放事件处理
    handleMouseUp() {
      this.isDragging = false;
      
      // 移除拖动类以恢复过渡动画
      if (this.$refs.orgChartRef) {
        this.$refs.orgChartRef.classList.remove('dragging');
      }
      
      // 取消之前的动画帧
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      
      // 移除全局事件监听器
      document.removeEventListener('mousemove', this.handleMouseMove);
      document.removeEventListener('mouseup', this.handleMouseUp);
    },
    // 触摸结束事件处理
    handleTouchEnd() {
      this.isDragging = false;
      if (this.$refs.orgChartRef) {
        this.$refs.orgChartRef.classList.remove('dragging');
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      document.removeEventListener('touchmove', this.handleTouchMove);
      document.removeEventListener('touchend', this.handleTouchEnd);
      document.removeEventListener('touchcancel', this.handleTouchEnd);
    },
    // 重置视图
    resetView() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
    },
    // 阻止浏览器默认的Ctrl+滚轮缩放行为
    preventDefaultZoom(event) {
      if (event.ctrlKey && (event.deltaY !== 0)) {
        event.preventDefault();
      }
    }
  }
};
</script>

<style lang="scss">
.org-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.org-chart {
  text-align: center;
  transition: transform 0.2s ease;
  cursor: grab;
  touch-action: none;
  
  &.dragging {
    transition: none;
  }
  
  &:active {
    cursor: grabbing;
  }
}

.zoom-controls {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid #ddd;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background-color: #f5f5f5;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    background-color: #e0e0e0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

</style>
