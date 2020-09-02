<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--添加分类按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类
          </el-button>
        </el-col>
      </el-row>
      <!--表格区-->
      <tree-table
        class="treeTable"
        :columns="columns"
        :data="cateList"
        :expand-type="false"
        :selection-type="false"
        :show-index="true"
        border
        :show-row-hover="false"
      >
        <!--是否有效-->
        <template v-slot:isok="scope">
          <i
            style="color: #67C23A"
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i style="color: #E6A23C" class="el-icon-error" v-else></i>
        </template>
        <!--排序-->
        <template v-slot:order="scope">
          <el-tag size="mini" type="primary" v-if="scope.row.cat_level === 0"
            >一级
          </el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级
          </el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!--操作-->
        <template v-slot:opt="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditCateDialog(scope.row.cat_id)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
          >
            删除
          </el-button>
        </template>
      </tree-table>
      <!--分页区-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
      <!--添加分类对话框-->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
        >
          <!--添加分类的表单-->
          <el-form-item label="分类名称：" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类：">
            <el-cascader
              clearable
              v-model="selectedKeys"
              :options="parentCateList"
              :props="{
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: true
              }"
              @change="parentCateChanged"
            ></el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer"
          ><el-button @click="addCateDialogVisible = false">取 消</el-button
          ><el-button type="primary" @click="addCate">确 定</el-button></span
        >
      </el-dialog>
      <!--编辑分类对话框-->
      <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%">
        <el-form
          :model="editForm"
          :rules="addCateFormRules"
          ref="editFormRef"
          label-width="100px"
        >
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editCate">
            确 定
          </el-button>
        </span>
      </el-dialog>
      <!--删除分类对话框-->
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //商品分类数据列表
      cateList: [],
      //总数据条数
      total: 0,
      //tree-table的列名
      columns: [
        { label: "分类名称", prop: "cat_name" },
        { label: "是否有效", type: "template", template: "isok" },
        { label: "排序", type: "template", template: "order" },
        { label: "操作", type: "template", template: "opt" }
      ],
      //添加分类对话框的显示隐藏
      addCateDialogVisible: false,
      //添加分类的表单数据
      addCateForm: {
        //将要添加的分类的名称
        cat_name: "",
        //父级分类的id
        cat_pid: 0,
        cat_level: 0
      },
      //添加分类的表单验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "分类名长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ]
      },
      //父级分类数据列表
      parentCateList: [],
      //被选中的分类id
      selectedKeys: [],
      //编辑对话框的显示和隐藏
      editDialogVisible: false,
      //按id查询的分类
      editForm: {}
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.axios.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
      // console.log(this.cateList, "this.cateList");
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    //监听pagenum改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    //点击按钮显示添加分类对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表 再展示对话框
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.axios.get("categories", {
        params: {
          type: 2
        }
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取分类数据失败");
      }
      console.log(res.data);
      this.parentCateList = res.data;
    },
    //级联选择器发生变化触发change事件
    parentCateChanged() {
      console.log(this.selectedKeys);
      //如果selectedKeys数组的length=0 要添加的是父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击确认 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.axios.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        await this.getCateList();
        this.$message.success("添加分类成功");
        this.addCateDialogVisible = false;
      });
    },
    //添加分类对话框关闭事件 重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    //编辑分类对话框的显示和隐藏
    async showEditCateDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.axios.get("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败");
      }
      this.editForm = res.data;
    },
    //提交编辑后的分类
    editCate() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.axios.put(
          "categories/" + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新失败");
        }
        this.$message.success("更新成功");
        this.editDialogVisible = false;
        await this.getCateList();
      });
    },
    //根据id删除分类
    async removeCateById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      console.log(id, confirmResult);
      if (confirmResult !== "confirm") {
        return this.$message.error("已取消删除");
      }
      const { data: res } = await this.axios.delete("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删除分类成功");
      await this.getCateList();
    }
  }
};
</script>

<style scoped lang="scss">
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
