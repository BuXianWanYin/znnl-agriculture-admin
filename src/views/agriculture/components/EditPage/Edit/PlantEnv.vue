<template>
    <!-- Banner & Image 通用组件 -->
    <div class="image-content">
        <p class="desc">添加生长环境 (可拖动排序）</p>
        <vuedraggable
            v-model="list.data"
            tag="ul"
            draggable="li"
            v-if="list.data && list.data.length > 0"
            class="image-list"
            :class="{ disable: data.tabType == 2 }"
        >
            <li v-for="(item, index) in list.data" :key="index">
                <div class="l-info">
                      <p><span class="width-20 height-20 border-radius-10 flex jcc aic background-color-primary font-color-fff">{{ index + 1 }}</span></p>
                    <p class="flex aic">
                        <span>环境名：</span>
                        <el-input class="width-160 "  placeholder="" v-model="item.name" size="mini" clearable autofocus></el-input>
                    </p>
                    <p class="flex aic">
                        <span>环境值：</span>
                        <el-input class="width-160 "  placeholder="" v-model="item.value" size="mini" clearable autofocus></el-input>
                    </p>
                    <p class="flex aic">
                        <span>值单位：</span>
                        <el-input class="width-160 "  placeholder="" v-model="item.unit" size="mini" clearable autofocus></el-input>
                    </p>
                    <p class="flex aic">
                        <span>字体色：</span>
                         <el-color-picker v-model="item.color"></el-color-picker>
                    </p>
                </div>
                <div class="r-image">
                    <span @click="removeImage(index)" class="el-icon-close"></span>
                    <div class="image-box">
                        <img :src="item && $baseUrl+item.url">
                        <span @click="addImage(index)" class="el-icon-edit-outline"></span>
                    </div>
                </div>
            </li>
        </vuedraggable>
        <template >
            <el-button
                type="primary"
                icon="el-icon-plus"
                @click="addItem"
                class="add-image"
            >
                添加生长环境
            </el-button>
            <p class="size">（建议尺寸： 350*350 ）</p>
        </template>
        <el-upload
            ref="upload"
            :http-request="upload"
            :show-file-list="false"
            multiple
            action
            style="display:none"
        >
        </el-upload>
    </div>
</template>

<script>
import vuedraggable from 'vuedraggable'
import uploadFile from './upload'
export default {
    name: 'PlantEnv',
    components: {
        vuedraggable
    },
    props: {
        data: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            list: {},
            url: '',
            index: null,
            imageIndex: null,
        }
    },
    mounted() {
        this.list = this.data
    },
    methods: {
		removeImage(index) {
            this.list.data.splice(index, 1)
		},
        addItem(){
            const data = {
                name: '',
                value:'',
                color:'',
                url:''
            }
            this.list.data.push(data);
        },
        addImage(index) {
			this.imageIndex = index
			this.$refs['upload'].$children[0].$refs.input.click()
        },
        async upload(params) {
			const file = params.file,
				  fileType = file.type;

            const verifyList = [
                    {
                        text: "只能上传图片格式png、jpg、gif!",
                        result: fileType.indexOf('image') != -1
                    },
                    {
                        text: "只能上传大小小于5M",
                        result: file.size / 1024 / 1024 < 5
                    }
                ]

            for (let item of verifyList) {
                if (!item.result) {
                    this.$message.error(item.text)
                    return
                }
            }

			const form = new FormData();
			form.append("file", file);

            const {url} = await uploadFile(form);

            const index = this.imageIndex
            const data = {
                name: '',
                value:'',
                unit:'',
                color:'',
                url:url
            }

            if (index !== null) {
                this.list.data[index].url = url
            } else {
                this.list.data.push(data)
            }
		}
    }
}
</script>

<style lang="scss" scoped>
.image-content{
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    height: 100%;
    overflow: hidden;
    .desc{
        text-align: center;
        font-size: 12px;
        color: #666;
        margin: 18px 0;
        padding-bottom: 10px;
        border-bottom: 1px dashed #ddd;
    }
    .size{
        text-align: center;
        font-size: 12px;
        color: #999;
        margin-bottom: 0;
    }
    .add-image{
        width: calc(100% - 20px);
        height: 34px;
        line-height: 34px;
        padding: 0;
        font-size: 12px;
        margin-left: 10px;
        margin-top: 10px;
    }
    .image-list{
        margin: 0;
        padding: 0 10px;
        overflow: auto;
        &::-webkit-scrollbar-thumb{
            background: #dbdbdb;
            border-radius: 10px;
        }
        &::-webkit-scrollbar-track{
            background: #f6f6f6;
            border-radius: 10px;
        }
        &::-webkit-scrollbar{
            width: 6px;
        }
        li{
            list-style: none;
            background: #f7f8f9;
            border-radius: 4px;
            padding: 6px 14px 10px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            &.disable div{
                pointer-events: none;
                user-select: none;
            }
            .l-info{
                font-size: 12px;
                width: calc(100% - 70px);
                p{
                    margin: 12px 0 0;
                    white-space: nowrap;
                    overflow: hidden;
                    display: flex;
                    .link{
                        color: #1b8bff;
                        cursor: pointer;
                    }
                    .text{
                        white-space: nowrap;
                        text-align: -webkit-auto;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                }
            }
            .r-image{
                text-align: right;
                .el-icon-close{
                    color: #999;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 6px;
                    cursor: pointer;
                    &:hover{
                        color: red;
                    }
                }
                .image-box{
                    width: 70px;
                    height: 70px;
                    border-radius: 5px;
                    overflow: hidden;
                    position: relative;
                    background: #fff;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    &::before{
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,.5);
                        opacity: 0;
                        transition: all .3s;
                    }
                    span{
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        color: #fff;
                        transform: translate(-50%, -50%);
                        font-size: 20px;
                        cursor: pointer;
                        opacity: 0;
                        transition: all .3s;
                    }
                    img{
                        max-width: 100%;
                    }
                    &:hover{
                        &::before, span{
                            opacity: 1;
                        }
                    }
                }
            }
        }
    }
}
</style>
