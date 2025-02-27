import { Injectable, OnModuleInit } from "@nestjs/common";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "@app/entities";
import { ERROR_CODE } from "@app/constants/error-code.constant";
import { FailException } from "@app/exceptions/fail.exception";
import { IncomeandExpense } from "@app/constants/enum";

export const DEFAULT_CATEGORIES = [
  {
    name: "餐饮美食",
    type: IncomeandExpense.expense,
    icon: "restaurant",
    isDefault: true,
  },
  {
    name: "交通出行",
    type: IncomeandExpense.expense,
    icon: "directions_car",
    isDefault: true,
  },
  {
    name: "工资收入",
    type: IncomeandExpense.income, // 明确类型
    icon: "attach_money",
    isDefault: true,
  },
  {
    name: "投资理财",
    type: IncomeandExpense.income,
    icon: "trending_up",
    isDefault: true,
  },
];

@Injectable()
export class CategoryService  {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>
  ) {}

  // async onModuleInit() {
  //   await this.seedDefaultCategories();
  // }

  // 新增方法：根据ID获取分类（带权限校验）
  async getById(id: number, userId?: number): Promise<Category> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ["user"], // 加载用户关系用于权限校验
    });

    if (!category) {
      throw new FailException(ERROR_CODE.COMMON.RECORD_NOT_EXISTS);
    }

    // 验证权限：如果传了 userId，需检查分类归属
    if (userId && category.user?.id !== userId) {
      throw new FailException(ERROR_CODE.COMMON.RESTRICTED_PERMISSIONS);
    }

    return category;
  }

  // private async seedDefaultCategories() {
  //   for (const catData of DEFAULT_CATEGORIES) {
  //     const exists = await this.categoryRepo.findOne({
  //       where: {
  //         name: catData.name,
  //         isDefault: true,
  //       },
  //     });
  //     if (exists===null) {
  //       await this.categoryRepo.save(
  //         this.categoryRepo.create({
  //           ...catData,
  //           user: null, // 系统分类无归属用户
  //         })
  //       );
  //     }
  //   }
  // }

  // 创建用户自定义分类
  async createUserCategory(userId: number, dto: CreateCategoryDto) {
    const isHad = await this.categoryRepo.findOne({
      where: {
        name: dto.name,
        user: { id: userId },
      },
    });
    
    if (isHad) {
      throw new FailException(ERROR_CODE.COMMON.RECORD_EXITS);
    }
    return this.categoryRepo.save({
      ...dto,
      isDefault: false,
      user: { id: userId },
    });
  }

  // 删除分类（系统分类不可删）
  async deleteCategory(categoryId: number, uid: number) {
    
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId, user: { id: uid } },
      relations: ["records"],
    });
    

    if (!category) throw new FailException(ERROR_CODE.COMMON.RECORD_NOT_EXISTS);

    if (category.isDefault) {
      throw new FailException(ERROR_CODE.COMMON.RESTRICTED_PERMISSIONS);
    }
    if (category.records?.length > 0) {
      throw new FailException(ERROR_CODE.COMMON.RESTRICTED_PERMISSIONS);
    }

    return this.categoryRepo.delete(categoryId);
  }

  // 获取分类时按类型过滤
  async getUserCategories(userId: number, type?: IncomeandExpense) {
    const where: any = { user: { id: userId } };
    if (type) where.type = type;

    const [systemCats, userCats] = await Promise.all([
      this.categoryRepo.find({
        where: { isDefault: true, ...(type && { type }) },
      }),
      this.categoryRepo.find({ where }),
    ]);

    return [...systemCats, ...userCats];
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    await this.categoryRepo.update(id, dto);
    return this.categoryRepo.findOneBy({ id }); // 返回更新后的实体
  }
}
