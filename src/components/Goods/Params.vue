<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--警告区域-->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      >
      </el-alert>
      <!--选择商品分类区域-->
      <el-row class="cat-opt">
        <el-col>
          <span>选择商品分类：</span>
          <!--选择商品分类的级联选择框-->
          <el-cascader
            v-model="selectedCatKeys"
            :options="cateList"
            :props="{
              expandTrigger: 'hover',
              value: 'cat_id',
              label: 'cat_name',
              children: 'children'
            }"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!--tab标签-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态参数" name="many">
          <!--添加动态参数面板-->
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisable"
            @click="addDialogVisible = true"
          >
            添加参数
          </el-button>
          <!--table表格-->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                >
                  {{ item }}
                </el-tag>
                <!--输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--添加按钮-->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="参数名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  修改
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!--添加静态属性面板-->
          <el-button
            size="mini"
            type="primary"
            :disabled="isBtnDisable"
            @click="addDialogVisible = true"
          >
            添加属性
          </el-button>
          <!--table表格-->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <!--循环渲染tag标签-->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                >
                  {{ item }}
                </el-tag>
                <!--输入文本框-->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--添加按钮-->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="序号"></el-table-column>
            <el-table-column
              prop="attr_name"
              label="属性名称"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  修改
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
      <!--添加参数对话框-->
      <el-dialog
        :title="'添加' + this.titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <el-form
          :model="addForm"
          :rules="addFormRules"
          ref="addFormRef"
          label-width="80px"
        >
          <el-form-item :label="this.titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">
            取 消
          </el-button>
          <el-button type="primary" @click="addParams">
            确 定
          </el-button>
        </span>
      </el-dialog>
      <!--修改参数对话框-->
      <el-dialog
        :title="'修改' + this.titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form
          :model="editForm"
          :rules="editFormRules"
          ref="editFormRef"
          label-width="80px"
        >
          <el-form-item :label="this.titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">
            取 消
          </el-button>
          <el-button type="primary" @click="editParams">
            确 定
          </el-button>
        </span>
      </el-dialog>
      <!--删除参数对话框-->
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Params",
  data() {
    return {
      //所有商品分类列表
      cateList: [],
      //级联选择框双向绑定到的数组
      selectedCatKeys: [],
      //被激活的页签的名称
      activeName: "many",
      //参数列表
      //动态参数
      manyTableData: [],
      //静态属性
      onlyTableData: [],
      //添加动态参数对话框的显示和隐藏
      addDialogVisible: false,
      //添加动态参数 表单数据
      addForm: {
        attr_name: "",
        attr_sel: this.activeName
      },
      //添加动态参数的表单验证规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
          { min: 1, max: 10, message: "长度在 1 到 10 个字符", trigger: "blur" }
        ]
      },
      //控制修改对话框的显示与隐藏
      editDialogVisible: false,
      //修改的表单数据对象
      editForm: {},
      //修改的表单验证规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取所有商品分类
    async getCateList() {
      const { data: res } = await this.axios.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类数据失败");
      }
      this.cateList = res.data;
    },
    //监听级联选择框的change事件
    handleChange() {
      this.getParamsData();
    },
    //tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData();
    },
    //获取参数的数据列表
    async getParamsData() {
      if (this.selectedCatKeys.length !== 3) {
        this.selectedCatKeys = [];
        //如果选择的不是三级菜单 清空原有的表格数据
        this.manyTableData = [];
        this.onlyTableData = [];
        return;
      }
      //选择的是三级分类
      console.log(this.selectedCatKeys);
      //根据当前所选分类的id和当前所处的面板获取对应的参数
      const { data: res } = await this.axios.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败");
      }
      // this.cateList = res.data;
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        //单独控制每个tag标签文本框的显示和隐藏
        item.inputVisible = false;
        //文本框中输入的值
        item.inputValue = "";
      });
      console.log("res", res.data);
      switch (this.activeName) {
        case "many":
          this.manyTableData = res.data;
          break;
        default:
          this.onlyTableData = res.data;
          break;
      }
    },
    //添加属性对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //点击确认添加参数
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.axios.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加失败");
        }
        this.$message.success("添加成功");
        this.addDialogVisible = false;
        await this.getParamsData();
      });
    },
    //点击展示修改对话框
    async showEditDialog(attr_id) {
      //查询当前参数信息
      // eslint-disable-next-line no-unused-vars
      const { data: res } = await this.axios.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("获取参数信息失败!");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //修改对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击按钮 修改参数信息
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const {
          data: res
        } = await this.axios.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          { attr_name: this.editForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新失败!");
        }
        await this.getParamsData();
        this.editDialogVisible = false;
        this.$message.success("更新成功");
      });
    },
    //根据id删除参数信息
    async removeParamsById(attr_id) {
      console.log(attr_id);
      const confirmResult = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.error("已取消删除");
      }
      const { data: res } = await this.axios.delete(
        ` categories/${this.cateId}/attributes/${attr_id}`
      );
      if (res.meta.status !== 200) {
        console.log(res);
        return this.$message.error("删除失败");
      }
      this.$message.success("删除成功");
      await this.getParamsData();
    },
    //新增tag标签 文本框失去焦点 或是按下Enter键都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      //如果没有return 则证明输入了 有效的内容 需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      //发起请求 保存本次数据
      this.saveAttrVals(row);
    },
    //点击按钮 显示文本输入框
    showInput(row) {
      row.inputVisible = true;
      //页面重新渲染 触发 $nextTick()回调
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    //将对 attr_vals的操作保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.axios.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("修改参数项失败");
      }
      this.$message.success("修改参数项成功");
    },
    //点击x删除对应的参数选项tag标签
    handleClose(index, row) {
      row.attr_vals.splice(index, 1);
      //发起请求 保存本次数据
      this.saveAttrVals(row);
    }
  },
  computed: {
    //如果按钮需要被禁用则返回true;否则返回false
    isBtnDisable() {
      return this.selectedCatKeys.length !== 3;
    },
    //当前选中的三级分类id
    cateId() {
      if (this.selectedCatKeys.length === 3) {
        return this.selectedCatKeys[2];
      }
      return null;
    },
    //动态计算标题文本
    titleText() {
      if (this.activeName === "many") {
        return "动态参数";
      }
      return "静态属性";
    }
  }
};
</script>

<style scoped lang="scss">
.cat-opt {
  margin-top: 15px;
}
.input-new-tag {
  width: 120px;
}
.el-tag {
  margin-right: 10px;
}
</style>
