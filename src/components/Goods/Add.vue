<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--提示区域-->
      <el-alert
        title="添加商品信息"
        type="info"
        show-icon
        center
        :closable="false"
      >
      </el-alert>
      <!--步骤条区域-->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--tab栏区域-->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{
                  expandTrigger: 'hover',
                  value: 'cat_id',
                  label: 'cat_name',
                  children: 'children'
                }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--渲染表单的item项-->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!--复选框组-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!--渲染表单的item项-->
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              :action="upLoadUrl"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
            ></quill-editor>
            <!--添加商品按钮-->
            <el-button type="primary" class="btnAdd" @click="addGoods"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!--图片预览对话框-->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";
export default {
  name: "Add",
  data() {
    return {
      activeIndex: "0",
      //添加商品表单数据
      addForm: {
        goods_name: "",
        goods_price: 1,
        goods_weight: 1,
        goods_number: 1,
        goods_cat: [],
        pics: [],
        goods_introduce: "",
        attrs: []
      },
      //添加商品表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
          { type: "number", message: "必须为数字值" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
          { type: "number", message: "必须为数字值" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
          { type: "number", message: "必须为数字值" }
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" }
        ]
      },
      //商品分类数据
      cateList: [],
      //动态参数
      manyTableData: [],
      //静态属性
      onlyTableData: [],
      //图片上传地址
      upLoadUrl: "http://timemeetyou.com:8889/api/private/v1/upload",
      //图片上传组件的请求头
      headersObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      //图片预览路径
      previewPath: "",
      //展示图片预览对话框
      previewVisible: false
    };
  },
  created() {
    //获取所有商品分类数据
    this.getCateList();
  },
  methods: {
    //获取商品分类数据列表
    async getCateList() {
      const { data: res } = await this.axios.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败!");
      }
      this.cateList = res.data;
      console.log(res.data);
    },
    //级联选择器change事件
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    //标签页切换事件
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择分类!");
        return false;
      }
    },
    tabClicked: async function() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败");
        }
        console.log(res.data);
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.axios.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" }
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性列表失败");
        }
        console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    //处理图片预览效果
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    //处理移除图片的操作
    handleRemove(file) {
      console.log(file);
      //1.获取将要删除的图片临时路径
      const filePath = file.response.data.tmp_path;
      //2.从pics数组中找到图片对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath);
      //3.调用数组的splice方法 把图片信息对象 从pics数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    //图片上传成功
    handleSuccess(response) {
      console.log(response);
      //1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      //2.将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    //添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项!!!");
        }
        //执行添加商品的业务
        //处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" ")
          };
          this.addForm.attrs.push(newInfo);
        });
        //处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          };
          this.addForm.attrs.push(newInfo);
        });
        //深拷贝
        let form = _.cloneDeep(this.addForm);
        //处理商品分类
        form.goods_cat = form.goods_cat.join(",");
        console.log(form);
        //发起请求添加商品
        const { data: res } = await this.axios.post("goods", form);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败!");
        }
        this.$message.success("添加和商品成功!");
        form = null;
        await this.$router.push("/goods");
      });
    }
  },
  computed: {
    //当前选中的三级分类id
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    }
  }
};
</script>

<style scoped>
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
