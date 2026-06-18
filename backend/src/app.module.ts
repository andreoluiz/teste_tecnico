import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientesModule } from './clientes/clientes.module';
import { ProdutosModule } from './produtos/produtos.module';

@Module({
  imports: [PrismaModule, ClientesModule, ProdutosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
