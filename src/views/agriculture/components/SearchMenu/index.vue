<template>
  <div class="search-menu">
    <div class="search-menu-header">{{title}}</div>
    <div class="search-menu-body">
      <el-input
        v-model="queryParams[searchParma]"
        @input="handleInput"
        :placeholder="searchPlaceholder"
        prefix-icon="el-icon-search"
        class="search-input"
      />

      <div v-if="list.length > 0" class="batch-list" v-loading="loading">
        <el-card
          v-for="(item, index) in list"
          :key="item[keyName]"
          :class="['batch-card', { 'is-active': selectedIndex === index }]"
          @click.native="handleSelect(index)"
          shadow="hover"
        >
          <div class="batch-content">
            <div class="batch-main">
              <svg-icon :icon-class="icon" class="batch-icon" />
              <span class="batch-name" :title="item[labelName]">
                {{item[labelName].length > 11 ? `${item[labelName].substring(0, 11)}...`: item[labelName]}}
              </span>
            </div>
            <slot :data="item"></slot>
          </div>
        </el-card>
      </div>
      <el-empty v-else :image-size="100" description="暂无数据"></el-empty>
    </div>
    <div class="search-menu-footer">
      <el-pagination
        small
        background
        layout="prev, pager, next"
        :page-size="queryParams.pageSize"
        :total="total"
        @current-change="handlePagination"
        @prev-click="handlePagination"
        @next-click="handlePagination"
      />
    </div>
  </div>
</template>
<script>
export default {
  name: 'SearchMenu',
  props: {
    title:{
        type:String,
    },
    fun: [Function],
    searchParma: [String],
    searchPlaceholder: [String],
    keyName: [String],
    labelName: [String],
    activeMenu: {
      type: Object,
      default:function(){
          return{
              isActive:false,
              name:'',//属性
              value:''//值
          }
      }
    },
    icon: {
      type: String,
      default: 'land',
    },
    isSub: false,
    subIcon:{
        type:String,
        default:'channel'
    },
    subKeyName:[String],
    subLabelName:[String],
    subTag:Object,
    customClass:{
        type:String,
        default:''
    }
  },
  data() {
    return {
      loading: false,
      list: [],
      total: null,
      selectedIndex: null,
      queryParams: {
        pageNum: 1,
        pageSize: 16,
        [this.searchParma]: null,
      },
    };
  },
  computed:{
      defaultActive:{
          get:function(){
              const { isActive,name,value } = this.activeMenu;
              const { list } = this;
              if(isActive){
                  if(name && value){
                      let index =list.findIndex(item=>item[name]==value);
                      return index == -1?'0':index.toString();
                  }else{
                      return '0'
                  }
              }else{
                  return ''
              }
          }
      },
  },
  watch:{
      dataList:{
          handler:function(){

          }
      }
  },
  async created() {
    await this.getList();
    // 获取列表后，如果有数据则选中第一项
    if (this.list && this.list.length > 0) {
      this.selectedIndex = 0;
      this.$emit('select', this.list[0]);
    }
  },
  methods: {
    /** 查询列表 */
    async getList() {
      this.loading = true;
      try {
        if (typeof this.fun === 'function') {
          const { rows, total } = await this.fun(this.queryParams);
          this.list = rows;
          this.total = total;
          
          // 当列表更新时，如果有数据则选中第一项
          if (this.list && this.list.length > 0) {
            this.selectedIndex = 0;
            // 如果是搜索或翻页导致的列表更新，也需要触发选择事件
            this.$emit('select', this.list[0]);
          } else {
            this.selectedIndex = null;
          }
        }
      } finally {
        this.loading = false;
      }
    },
    handleSelect(index) {
      this.selectedIndex = index;
      if (this.isSub) {
        let childrenList = [];
        this.list.forEach(item => {
          childrenList = childrenList.concat(item.children);
        });
        this.$emit('select', childrenList.filter(item => item.channelSipId == index)[0]);
      } else {
        this.$emit('select', this.list[Number(index)]);
      }
    },
    handleInput(value) {
      this.queryParams[this.searchParma] = value;
      this.queryParams.pageNum = 1;
      this.getList();
    },
    handlePagination(e) {
      this.queryParams.pageNum = e;
      this.getList();
    }
  },
};
</script>
<style lang="scss" scoped>
.search-menu {
  &-header {
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    font-size: 16px;
    font-weight: 500;
    border-bottom: 1px solid #ebeef5;
  }

  &-body {
    height: calc(100vh - 84px - 56px - 50px - 30px);
    padding: 15px 20px;
    display: flex;
    flex-direction: column;

    .search-input {
      margin-bottom: 20px;
      
      ::v-deep .el-input__inner {
        border-radius: 4px;
        &:focus {
          border-color: #409EFF;
        }
      }
    }

    .batch-list {
      flex: 1;
      overflow-y: auto;
      padding-right: 5px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #e0e0e0;
        border-radius: 3px;
      }

      .batch-card {
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
        border-radius: 4px;
        border: 1px solid transparent;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        }

        &.is-active {
          background-color: #f0f7ff !important;
          border: 1px solid transparent !important;
          box-shadow: none !important;
          
          ::v-deep .el-card__body {
            border: none;
          }
          
          .batch-name {
            color: #409EFF;
            font-weight: 500;
          }

          .batch-icon {
            color: #409EFF;
          }
        }

        .batch-content {
          .batch-main {
            display: flex;
            align-items: center;
            
            .batch-icon {
              margin-right: 10px;
              font-size: 18px;
              color: #606266;
            }

            .batch-name {
              flex: 1;
              font-size: 14px;
              color: #303133;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }
    }
  }

  &-footer {
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 0;
    border-top: 1px solid #ebeef5;
  }
}

::v-deep {
  .el-card__body {
    padding: 14px 16px;
    border: none;
  }

  .el-card {
    border: 1px solid transparent;
    box-shadow: none !important;
    
    &:hover, &:focus {
      border-color: transparent;
    }
  }
  
  .el-card.is-active {
    border: none !important;
    box-shadow: none !important;
  }

  .el-pagination {
    .el-pager li {
      background: transparent;
      &.active {
        background-color: #409EFF;
        color: #fff;
      }
      &:hover {
        color: #409EFF;
      }
    }
  }
}
</style>
