/* eslint-disable prettier/prettier */

    import { Injectable, Inject } from '@nestjs/common';
    import { ClientProxy } from '@nestjs/microservices';

    @Injectable()
    export class AppService {
      constructor(
        @Inject('Microservices-services') private readonly productsClient: ClientProxy,
      ) {}

      createProduct(data:any): Promise<any> {
        return this.productsClient.send({ cmd: 'create-product' }, data).toPromise();
      }
       getAllproducts(): Promise<any> {
        return this.productsClient.send({ cmd: 'get-allproducts' }, {}).toPromise();
      }
       getProductById(id:string): Promise<any> {
        return this.productsClient.send({ cmd: 'get-product' }, id).toPromise();
      }
       updateProductById(id:string, data:any): Promise<any> {
        return this.productsClient.send({ cmd: 'update-product' }, {id,data}).toPromise();
      }
       DeleteProductById(id:string): Promise<any> {
        return this.productsClient.send({ cmd: 'delete-product' }, id).toPromise();
      }
    }