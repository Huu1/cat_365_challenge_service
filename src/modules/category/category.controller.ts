import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { CategoryService } from "./category.service";
import { User } from "@app/decorators/user.decorator";
import { IPayLoad } from "@app/shared/auth";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { FailException } from "@app/exceptions/fail.exception";
import { ERROR_CODE } from "@app/constants/error-code.constant";
import { IncomeandExpense } from "@app/constants/enum";

@Controller("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // 获取用户可用分类（合并系统+自定义）
  // 带类型过滤的查询
  @Get('list')
  getCategories(
    @User() user: IPayLoad,
    @Query("type") type?: IncomeandExpense
  ) {
    return this.categoryService.getUserCategories(user.id, type);
  }

  // 创建用户自定义分类
  @Post('add')
  createCategory(@User() user: IPayLoad, @Body() dto: CreateCategoryDto) {
    return this.categoryService.createUserCategory(user.id, dto);
  }

  // 更新分类（只能改用户自己的）
  @Post("update/:id")
  async updateCategory(
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
    @User() user: IPayLoad
  ) {
    const category = await this.categoryService.getById(+id);
    if (category.isDefault || category.user?.id !== user.id) {
      throw new FailException(ERROR_CODE.COMMON.RESTRICTED_PERMISSIONS);
    }
    return this.categoryService.updateCategory(+id, dto);
  }

  // 删除分类
  @Post("delete/:id")
  deleteCategory(@Param("id") id: string, @User() user: IPayLoad) {
    return this.categoryService.deleteCategory(+id, user.id);
  }


  @Post('init')
  async seedSystemAccounts() {
    return this.categoryService.seedDefaultCategories();
  }
}
