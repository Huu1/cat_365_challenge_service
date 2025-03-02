import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { BookService } from "./book.service";
import { IPayLoad } from "@app/shared/auth";
import { User } from "@app/decorators/user.decorator";
import { CreateBookDto } from "./dto/book.dto";

@Controller("book")
export class BookController {
  constructor(private readonly bookService: BookService) {}
  @Get()
  getLedgers(@User() user: IPayLoad) {
    return this.bookService.getUserBooks(user.id);
  }

  @Post()
  createLedger(@User() user: IPayLoad, @Body() dto: CreateBookDto) {
    return this.bookService.createBook(user.id, dto);
  }

  @Patch(":id/set-default")
  setDefault(@Param("id") ledgerId: string, @User() user: IPayLoad) {
    return this.bookService.setDefaultBook(user.id, +ledgerId);
  }

  @Delete(":id")
  deleteLedger(@Param("id") ledgerId: string, @User() user: IPayLoad) {
    return this.bookService.deleteBook(user.id, +ledgerId);
  }
}
