<template>
  <div>
    <!--面包屑导航区-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <!--搜索区-->
      <el-row>
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getOrdersList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrdersList"
              >搜索订单</el-button
            >
          </el-input>
        </el-col>
      </el-row>
      <!--订单表格区-->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column prop="pay_status" label="是否付款">
          <template v-slot="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template>
            <!--{{ scope.row }}-->
            <!--修改按钮-->
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showBox"
            ></el-button>
            <!--物流进度-->
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!--修改地址对话框-->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="{ expandTrigger: 'hover' }"
            style="width: 100%"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">
          确 定
        </el-button>
      </span>
    </el-dialog>
    <!--物流信息对话框-->
    <el-dialog title="查看物流进度" :visible.sync="progressVisible" width="50%">
      <!--物流进度时间线-->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :icon="activity.icon"
          :type="activity.type"
          :color="activity.color"
          :size="activity.size"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button @click="progressVisible = false">取 消</el-button>
        <el-button type="primary" @click="progressVisible = false">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from "./citydata";
export default {
  name: "Orders",
  data() {
    return {
      //获取订单列表的参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      //订单列表
      ordersList: [],
      //订单总数
      total: 0,
      //修改地址对话框的显示
      addressVisible: false,
      //地址表单
      addressForm: {
        address1: [],
        address2: ""
      },
      //地址表单验证对象
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" }
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" }
        ]
      },
      //城市信息
      cityData,
      //物流查询对话框
      progressVisible: false,
      //物流信息
      progressInfo: []
    };
  },
  created() {
    this.getOrdersList();
  },
  methods: {
    //获取订单列表
    async getOrdersList() {
      const { data: res } = await this.axios.get("orders", {
        params: this.queryInfo
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取订单失败!");
      }
      this.ordersList = res.data.goods;
      this.total = res.data.total;
    },
    //pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    //pagenum改变事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrdersList();
    },
    //展示修改订单地址对话框
    showBox() {
      this.addressVisible = true;
      console.log(this.cityData);
    },
    //修改订单地址对话框关闭事件
    addressDialogClosed() {
      this.$refs.addressFormRef.resetField();
    },
    //展示物流进度对话框
    async showProgressBox() {
      const { data: res } = await this.axios.get("/kuaidi/1106975712662");
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流信息失败！");
      }
      this.progressInfo = res.data;
      this.progressVisible = true;
    }
  }
};
</script>

<style scoped></style>
