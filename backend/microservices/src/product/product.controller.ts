/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { ProductService } from './product.service';
import { MessagePattern } from '@nestjs/microservices'

@Controller()
export class ProductController {
    constructor(private readonly productService: ProductService) { }
   @MessagePattern({cmd: 'create-product'})
   createProduct(data:any){
    return this.productService.create(data)
   }
   @MessagePattern({cmd: 'get-allproducts'})
    getProducts(){
    return this.productService.findAll()
   }
   @MessagePattern({cmd: 'get-product'})
    getproductById({id} : {id:string}){
    return this.productService.findOne(id)
   }
   @MessagePattern({cmd: 'update-product'})
    updateProductById({id,data} : {id:string; data:any}){
    return this.productService.update(id,data)
   }
   @MessagePattern({cmd: 'delete-product'})
    deleteProductById({id} : {id:string}){
    return this.productService.delete(id)
   }

}