<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区-->
    <el-card>
      <!--添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色
          </el-button>
        </el-col>
      </el-row>
      <!--角色列表-->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <!--            <pre>{{ scope.row }}</pre>-->
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bd-bottom', i1 === 0 ? 'bd-top' : '', 'vcenter']"
            >
              <!--渲染一级权限-->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级和三级权限-->
              <el-col :span="19">
                <!--通过for循环嵌套渲染二级权限-->
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bd-top', 'vcenter']"
                >
                  <!--渲染二级权限-->
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑
            </el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRoleById(scope.row.id)"
              >删除
            </el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--添加角色框-->
      <el-dialog
        title="添加角色"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed"
      >
        <el-form
          :model="addRolesForm"
          :rules="addRoleFormRules"
          ref="addRolesFormRef"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRoles">确 定</el-button>
        </span>
      </el-dialog>
      <!--修改角色框-->
      <el-dialog
        title="修改角色"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form
          :model="editRolesForm"
          :rules="editRoleFormRules"
          ref="editRolesFormRef"
          label-width="80px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRolesForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRolesForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRolesInfo">确 定</el-button>
        </span>
      </el-dialog>
      <!--分配权限对话框-->
      <el-dialog
        title="分配权限"
        :visible.sync="setRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed"
      >
        <!--树形控件-->
        <el-tree
          :data="rightsList"
          :props="treeProps"
          show-checkbox
          node-key="id"
          default-expand-all
          :default-checked-keys="defKey"
          ref="treeRef"
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      rolesList: [],
      //添加角色表单的显示隐藏
      addDialogVisible: false,
      //添加角色的表单数据
      addRolesForm: {
        roleName: "",
        roleDesc: ""
      },
      //添加角色的表单验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色名称长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色描述长度在 5 到 10 个字符",
            trigger: "blur"
          }
        ]
      },
      //编辑角色表单的显示隐藏
      editDialogVisible: false,
      //根据Id查询的角色表单数据
      editRolesForm: {},
      //修改角色的表单验证规则
      editRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色名称长度在 3 到 10 个字符",
            trigger: "blur"
          }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色描述长度在 5 到 10 个字符",
            trigger: "blur"
          }
        ]
      },
      //展示 设置角色权限的对话框
      setRightDialogVisible: false,
      //所有权限的数据
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: "authName",
        children: "children"
      },
      //默认选中的节点Id值数组
      defKey: [],
      //当前即将分配权限的角色id
      roleId: ""
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表
    async getRolesList() {
      const { data: res } = await this.axios.get("roles");
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }

      this.rolesList = res.data;
    },
    //添加用户对话框关闭事件
    addDialogClosed() {
      this.$refs.addRolesFormRef.resetFields();
    },
    //添加角色
    addRoles() {
      this.$refs.addRolesFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return;
        //校验通过 发起请求 添加角色
        const { data: res } = await this.axios.post("roles", this.addRolesForm);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加角色失败");
        }
        this.$message.success("添加角色成功");
        this.addDialogVisible = false;
        await this.getRolesList();
        //
      });
    },
    //展示修改角色对话框
    async showEditDialog(id) {
      console.log(id);
      this.editDialogVisible = true;
      const { data: res } = await this.axios.get("roles/" + id);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("查询角色失败");
      }
      this.editRolesForm = res.data;
    },
    //修改角色对话框的关闭事件
    editDialogClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },
    //修改角色信息并提交
    editRolesInfo() {
      this.$refs.editRolesFormRef.validate(async valid => {
        console.log(valid);
        if (!valid) return;
        const { data: res } = await this.axios.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新角色信息失败");
        }
        this.editDialogVisible = false;
        await this.getRolesList();
        this.$message.success("更新角色信息成功");
      });
    },
    //根据Id删除角色
    async removeRoleById(id) {
      //弹框询问是否删除
      console.log(id);
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      console.log(confirmResult);
      //如果用户确认删除 返回值为字符串 confirm
      //如果用户取消删除 返回值为字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.axios.delete("roles/" + id);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败!");
      }
      this.$message.success("删除成功!");
      await this.getRolesList();
      console.log("已确认删除");
    },
    //跟据id移除对应的权限
    async removeRightById(role, rightId) {
      //弹框询问是否删除
      console.log(role, rightId);
      const confirmResult = await this.$confirm(
        "此操作将取消该角色权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      console.log(confirmResult);
      //如果用户确认删除 返回值为字符串 confirm
      //如果用户取消删除 返回值为字符串 cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消");
      }
      const { data: res } = await this.axios.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("移除权限失败!");
      }
      this.$message.success("移除权限成功!");
      role.children = res.data;
    },
    //显示分配权限对话框
    async showSetRightDialog(role) {
      //保存当前角色id到data中
      this.roleId = role.id;
      //获取所有权限的数据
      const { data: res } = await this.axios.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限数据失败");
      }
      this.rightsList = res.data;
      console.log(this.rightsList);
      //递归获取三级节点的Id
      this.getLeafKey(role, this.defKey);
      this.setRightDialogVisible = true;
    },
    //递归获取当前角色的所有三级权限id 并保存到数组defKey
    getLeafKey(node, arr) {
      //如果当前节点不包含children属性 则是三级权限
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getLeafKey(item, arr);
      });
    },
    //分配权限对话框关闭时 清空deKey数组
    setRightDialogClosed() {
      this.defKey = [];
    },
    //点击确定 为角色分配权限 并提交到服务器
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      console.log(keys);
      const rids = keys.join(",");
      const { data: res } = await this.axios.post(
        `roles/${this.roleId}/rights`,
        { rids }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("分配角色权限失败");
      }
      this.$message.success("分配角色权限成功");
      await this.getRolesList();
      this.setRightDialogVisible = false;
    }
  }
};
</script>

<style scoped lang="scss">
.el-tag {
  margin: 7px;
}
.bd-top {
  border-top: 1px solid #eee;
}
.bd-bottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
