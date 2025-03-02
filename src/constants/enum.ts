export enum IncomeandExpense {
  income=1,
  expense,
}


export enum AccountType {
  CASH = 'cash',       // 资金账户（现金、银行卡等）
  CREDIT = 'credit',   // 信用账户（信用卡、花呗等）
  INVESTMENT = 'investment', // 理财账户（基金、股票等）
  RECEIVABLE = 'receivable', // 应收款项
  PAYABLE = 'payable'   // 应付款项
}

export const AccounttypeMap = {
  [AccountType.CASH]: 'asset',
  [AccountType.INVESTMENT]: 'asset',
  [AccountType.RECEIVABLE]: 'asset',
  [AccountType.CREDIT]: 'liability',
  [AccountType.PAYABLE]: 'liability'
};


// src/common/types/pagination.type.ts
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
