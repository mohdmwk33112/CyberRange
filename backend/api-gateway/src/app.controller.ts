/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('product')
export class AppController {
    constructor(private readonly appService: AppService) { }
    @Post('createproduct')
    createProduct(@Body()body:any){
      return this.appService.createProduct(body);
    }

    @Get('getallproducts')
    getAllproducts(){
      return this.appService.getAllproducts();
    }

    @Get('getproduct/:id')
    getProductById(@Param('id') id:string){
      return this.appService.getProductById(id);
    }
    @Put('updateproduct/:id')
    updateProductById(@Param('id') id:string, @Body()body:any){
      return this.appService.updateProductById(id,body);
    }

    @Delete('deleteproduct/:id')
    DeleteProductById(@Param('id') id:string){
      return this.appService.DeleteProductById(id);
    }

}