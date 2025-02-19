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
          <template v-if="isSub">
            <el-card
              v-for="(item,index) in list"
              :key="item[keyName]"
              :class="['batch-card', { 'is-active': defaultActive === index.toString() }]"
              shadow="hover"
            >
              <div class="batch-content">
                <div class="batch-main">
                  <svg-icon :icon-class="icon" class="batch-icon" />
                  <span class="batch-name" :title="item[labelName]">
                    {{item[labelName].length > 11 ? `${item[labelName].substring(0, 11)}...`: item[labelName]}}
                  </span>
                </div>
                <div v-if="item.children.length>0" class="sub-items">
                  <div 
                    v-for="subItem in item.children" 
                    :key="subItem[subKeyName]"
                    class="sub-item"
                    :class="{ 'disabled': subTag[subItem[subTag.propertyName]].disable }"
                    @click="handleSelect(subItem[subKeyName].toString())"
                  >
                    <svg-icon :icon-class="subIcon" class="sub-icon" />
                    <span class="sub-name">{{subItem[subLabelName].length > 11? `${subItem[subLabelName].substring(0, 11)}...`: subItem[subLabelName]}}</span>
                    <el-tag class="sub-tag" :type="subTag[subItem[subTag.propertyName]].type" size="mini">{{subTag[subItem[subTag.propertyName]].text}}</el-tag>
                  </div>
                </div>
                <div v-else class="no-data">暂无数据</div>
              </div>
            </el-card>
          </template>
          <template v-else>
            <el-card
              v-for="(item, index) in list"
              :key="item[keyName]"
              :class="['batch-card', customClass, { 'is-active': defaultActive === index.toString() }]"
              @click.native="handleSelect(index.toString())"
              shadow="hover"
            >
              <div class="batch-content">
                <div class="batch-main">
                  <slot :data="item">
                    <svg-icon :icon-class="icon" class="batch-icon" />
                    <span class="batch-name" :title="item[labelName]">
                      {{item[labelName].length > 11? `${item[labelName].substring(0, 11)}...`: item[labelName]}}
                    </span>
                  </slot>
                </div>
              </div>
            </el-card>
          </template>
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
        >
        </el-pagination>
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
      const { isActive,name,value } = this.activeMenu;
      const { list } = this;
      if(isActive){
          if(name && value){
              let item =list.find((i)=>i[name]==value);
              this.$emit('select',item ?item:this.list[0])
          }else{
              this.$emit('select',this.list[0])
          }
      }
    },
    methods: {
      /** 查询列表 */
      async getList() {
        this.loading = true;
        if (
          this.fun !== null &&
          typeof this.fun !== 'undefined' &&
          typeof this.fun === 'function'
        ) {
          const { rows, total } = await this.fun(this.queryParams);
          this.list = rows;
          this.total = total;
          this.loading = false;
        }
      },
      handleSelect(index) {
          if(this.isSub){
              let childrenList=[];
              this.list.forEach(item => {
                  childrenList = childrenList.concat(item.children);
              });
              this.$emit('select', childrenList.filter(item=>item.channelSipId==index)[0]);
          }else{
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
      height: 70px;
      display: flex;
      align-items: center;
      padding-left: 15px;
      font-size: 16px;
      font-weight: 500;
    }
    &-body {
      height: calc(100vh - 84px - 70px - 50px - 30px);
      padding: 0 15px;
      display: flex;
      flex-direction: column;

      .search-input {
        margin-bottom: 15px;
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
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            transform: translateY(-2px);
          }

          &.is-active {
            border-color: #409EFF;
            
            .batch-name {
              color: #409EFF;
            }
          }

          .batch-content {
            .batch-main {
              display: flex;
              align-items: center;
              
              .batch-icon {
                margin-right: 8px;
                font-size: 16px;
              }

              .batch-name {
                flex: 1;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
            }
          }

          .sub-items {
            margin-top: 8px;
            
            .sub-item {
              display: flex;
              align-items: center;
              padding: 6px 0;
              
              &.disabled {
                opacity: 0.5;
                cursor: not-allowed;
              }

              .sub-icon {
                margin-right: 5px;
                font-size: 14px;
              }

              .sub-name {
                flex: 1;
                font-size: 13px;
              }

              .sub-tag {
                margin-left: 5px;
              }
            }
          }

          .no-data {
            text-align: center;
            color: #999;
            font-size: 12px;
            padding: 10px 0;
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
    }
  }
  ::v-deep {
    .el-card__body {
      padding: 12px 15px;
    }

    .el-pagination {
      .el-pager li.active {
        background-color: #409EFF;
        color: #fff;
      }
    }
  }
  </style>
  